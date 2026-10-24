import type { AnalysisResult } from './instagramParser'

const STORAGE_KEY = 'ifall:results:v2'
const LEGACY_KEY = 'ifall_results'

let memory: AnalysisResult | null = null

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (value === null || typeof value !== 'object') return false
  const result = value as Partial<AnalysisResult>

  return (
    isStringArray(result.followers) &&
    isStringArray(result.following) &&
    isStringArray(result.notFollowingBack) &&
    isStringArray(result.youDontFollowBack) &&
    isStringArray(result.mutual) &&
    typeof result.analyzedAt === 'string' &&
    result.inactive !== undefined &&
    isStringArray(result.inactive.followers) &&
    isStringArray(result.inactive.following) &&
    isStringArray(result.inactive.notFollowingBack)
  )
}

/**
 * Results live in memory first, with sessionStorage as a best-effort mirror so a page
 * refresh does not lose them. A storage failure (private mode, quota) must never break
 * the flow, and anything malformed is discarded rather than crashing the results page.
 */
export function saveResult(result: AnalysisResult): void {
  memory = result
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result))
  } catch {
    // Quota exceeded or storage disabled: in-memory copy is still usable.
  }
}

export function loadResult(): AnalysisResult | null {
  if (memory) return memory

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isAnalysisResult(parsed)) {
      clearResult()
      return null
    }

    memory = parsed
    return parsed
  } catch {
    clearResult()
    return null
  }
}

export function clearResult(): void {
  memory = null
  try {
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(LEGACY_KEY)
  } catch {
    // Nothing to do.
  }
}
