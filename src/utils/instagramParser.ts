import JSZip from 'jszip'

/** Hard limit for an uploaded archive, checked before we inflate anything. */
export const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024

/** A standard Instagram JSON export keeps these files inside `followers_and_following/`. */
const FOLLOWER_FILE = /^followers(?:_\d+)?\.json$/i
const FOLLOWING_FILE = /^following(?:_\d+)?\.json$/i

export type AnalysisErrorCode =
  | 'NOT_A_ZIP'
  | 'TOO_LARGE'
  | 'EMPTY_ARCHIVE'
  | 'MISSING_FOLLOWERS'
  | 'MISSING_FOLLOWING'
  | 'EMPTY_FOLLOWERS'
  | 'EMPTY_FOLLOWING'
  | 'UNREADABLE'

export class AnalysisError extends Error {
  readonly code: AnalysisErrorCode

  constructor(code: AnalysisErrorCode, message: string) {
    super(message)
    this.name = 'AnalysisError'
    this.code = code
  }
}

export interface AnalysisResult {
  followers: string[]
  following: string[]
  notFollowingBack: string[]
  youDontFollowBack: string[]
  mutual: string[]
  /**
   * Accounts that appear in the export without a profile link. Instagram omits the
   * link for accounts that are deactivated, deleted or renamed, so these are flagged
   * instead of being silently counted as normal relationships.
   */
  inactive: {
    followers: string[]
    following: string[]
    notFollowingBack: string[]
  }
  files: {
    followers: string[]
    following: string[]
  }
  /** ISO timestamp of when the comparison ran. */
  analyzedAt: string
}

interface Account {
  /** Username exactly as it appeared in the export, trimmed of whitespace and any leading @. */
  display: string
  /** False when the export has no profile link for this account. */
  hasProfile: boolean
}

type AccountMap = Map<string, Account>

function addAccount(map: AccountMap, rawValue: unknown, rawHref: unknown): void {
  if (typeof rawValue !== 'string') return

  const display = rawValue.trim().replace(/^@/, '')
  if (!display) return

  const key = display.toLowerCase()
  const hasProfile = typeof rawHref === 'string' && rawHref.trim().length > 0
  const existing = map.get(key)

  if (!existing) {
    map.set(key, { display, hasProfile })
    return
  }

  // Keep the first spelling we saw, but upgrade to a profile link if a later entry has one.
  if (!existing.hasProfile && hasProfile) existing.hasProfile = true
}

/**
 * Derives a username from a profile URL.
 *
 * Some exports omit `value` entirely and only carry the link, occasionally in the
 * `instagram.com/_u/<username>` form, so the link is a usable last resort.
 */
function usernameFromHref(rawHref: unknown): string | null {
  if (typeof rawHref !== 'string' || !rawHref.trim()) return null

  try {
    const segments = new URL(rawHref).pathname.split('/').filter(Boolean)
    if (segments[0] === '_u') segments.shift()
    const candidate = segments.pop()
    return candidate ? decodeURIComponent(candidate) : null
  } catch {
    return null
  }
}

/**
 * Pulls usernames out of one parsed JSON document.
 *
 * Handles the shapes Instagram has shipped over time: `string_list_data` entries,
 * `relationships_following` wrappers, plain `{ username }` objects and bare strings.
 * The walk is depth-limited so a pathological file cannot blow the stack.
 */
function collectAccounts(node: unknown, map: AccountMap, depth = 0): void {
  if (depth > 20 || node === null || typeof node !== 'object') return

  if (Array.isArray(node)) {
    for (const item of node) collectAccounts(item, map, depth + 1)
    return
  }

  const record = node as Record<string, unknown>
  const listData = record.string_list_data
  const hasListData = Array.isArray(listData)

  if (hasListData) {
    for (const entry of listData) {
      if (entry === null || typeof entry !== 'object') continue
      const item = entry as Record<string, unknown>

      // `value` is the usual field, but some exports carry the username only in the
      // parent's `title` and put nothing but a link inside string_list_data.
      const username = item.value ?? record.title ?? item.username ?? usernameFromHref(item.href)
      addAccount(map, username, item.href)
    }
  }

  if (!hasListData) {
    addAccount(map, record.value, record.href)
    addAccount(map, record.username, record.href)
    addAccount(map, record.title, record.href)

    if (record.value === undefined && record.username === undefined && record.title === undefined) {
      addAccount(map, usernameFromHref(record.href), record.href)
    }
  }

  for (const [key, value] of Object.entries(record)) {
    if (key === 'string_list_data') continue
    if (value !== null && typeof value === 'object') collectAccounts(value, map, depth + 1)
  }
}

function fileNameOf(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 1].toLowerCase()
}

export interface ExportFiles {
  followers: string[]
  following: string[]
}

/**
 * Locates the follower/following files by their **file name**, never by their path.
 *
 * Matching on the full path is wrong: every file inside `followers_and_following/`
 * contains both "follower" and "following", so a path substring test parses
 * `following.json` as a followers file and makes every result compare equal.
 */
export function findExportFiles(zip: JSZip): ExportFiles {
  const followers: string[] = []
  const following: string[] = []

  for (const path of Object.keys(zip.files)) {
    const entry = zip.files[path]
    if (!entry || entry.dir) continue

    const name = fileNameOf(path)
    if (FOLLOWER_FILE.test(name)) followers.push(path)
    else if (FOLLOWING_FILE.test(name)) following.push(path)
  }

  return { followers: followers.sort(), following: following.sort() }
}

async function readFile(zip: JSZip, path: string): Promise<unknown> {
  const entry = zip.files[path]
  if (!entry) return null
  const text = await entry.async('string')
  return JSON.parse(text) as unknown
}

function toSortedArray(map: AccountMap): string[] {
  return Array.from(map.values(), (account) => account.display).sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' }),
  )
}

function withoutProfile(map: AccountMap): string[] {
  return toSortedArray(
    new Map(Array.from(map).filter(([, account]) => !account.hasProfile)),
  )
}

function difference(base: AccountMap, other: AccountMap): string[] {
  const result = new Map<string, Account>()
  for (const [key, account] of base) {
    if (!other.has(key)) result.set(key, account)
  }
  return toSortedArray(result)
}

function intersection(a: AccountMap, b: AccountMap): string[] {
  const result = new Map<string, Account>()
  for (const [key, account] of a) {
    if (b.has(key)) result.set(key, account)
  }
  return toSortedArray(result)
}

/**
 * Compares the two lists from an already-opened archive.
 *
 * Throws AnalysisError instead of returning empty lists when a side is missing or
 * unreadable: "no data" must never be presented as "zero followers".
 */
export async function analyzeZip(zip: JSZip): Promise<AnalysisResult> {
  const files = findExportFiles(zip)

  if (files.followers.length === 0) {
    throw new AnalysisError(
      'MISSING_FOLLOWERS',
      "We couldn't find your followers file in this archive.",
    )
  }
  if (files.following.length === 0) {
    throw new AnalysisError(
      'MISSING_FOLLOWING',
      "We couldn't find your following file in this archive.",
    )
  }

  const followers: AccountMap = new Map()
  const following: AccountMap = new Map()
  let parsedAny = false

  for (const path of files.followers) {
    try {
      collectAccounts(await readFile(zip, path), followers)
      parsedAny = true
    } catch {
      // A single unreadable file should not discard the rest of the export.
    }
  }

  for (const path of files.following) {
    try {
      collectAccounts(await readFile(zip, path), following)
      parsedAny = true
    } catch {
      // Same as above.
    }
  }

  if (!parsedAny) {
    throw new AnalysisError(
      'UNREADABLE',
      "We couldn't read this Instagram export. Make sure you picked the JSON archive.",
    )
  }
  if (followers.size === 0) {
    throw new AnalysisError('EMPTY_FOLLOWERS', 'Your follower list is empty in this export.')
  }
  if (following.size === 0) {
    throw new AnalysisError('EMPTY_FOLLOWING', 'The list of accounts you follow is empty in this export.')
  }

  const notFollowingBack = difference(following, followers)
  const notFollowingBackKeys = new Set(notFollowingBack.map((name) => name.toLowerCase()))

  return {
    followers: toSortedArray(followers),
    following: toSortedArray(following),
    notFollowingBack,
    youDontFollowBack: difference(followers, following),
    mutual: intersection(followers, following),
    inactive: {
      followers: withoutProfile(followers),
      following: withoutProfile(following),
      notFollowingBack: withoutProfile(following).filter((name) =>
        notFollowingBackKeys.has(name.toLowerCase()),
      ),
    },
    files,
    analyzedAt: new Date().toISOString(),
  }
}

/**
 * Validates an uploaded file and analyses it.
 *
 * @param onProgress Called with a 0-100 percentage and a short status label.
 */
export async function analyzeArchive(
  file: File,
  onProgress?: (percent: number, label: string) => void,
): Promise<AnalysisResult> {
  if (!/\.zip$/i.test(file.name)) {
    throw new AnalysisError('NOT_A_ZIP', 'That file is not a ZIP archive.')
  }
  if (file.size > MAX_ARCHIVE_BYTES) {
    throw new AnalysisError('TOO_LARGE', 'That archive is larger than the 100 MB limit.')
  }
  if (file.size === 0) {
    throw new AnalysisError('EMPTY_ARCHIVE', 'That file is empty.')
  }

  const report = onProgress ?? (() => {})
  report(5, 'Reading ZIP file…')

  const zip = await JSZip.loadAsync(file)
  report(30, 'Looking for follower and following data…')

  const files = findExportFiles(zip)
  if (files.followers.length === 0 && files.following.length === 0) {
    throw new AnalysisError(
      'UNREADABLE',
      "That doesn't look like an Instagram data export. Please choose the ZIP file you downloaded from Instagram.",
    )
  }

  report(45, 'Comparing followers and following…')
  const result = await analyzeZip(zip)
  report(100, 'Done.')
  return result
}
