import assert from 'node:assert/strict'
import test from 'node:test'
import JSZip from 'jszip'
import { AnalysisError, analyzeArchive, analyzeZip, findExportFiles } from './instagramParser.ts'

type Entry = { username: string; href?: string }

function followerEntry({ username, href }: Entry) {
  return {
    string_list_data: [{ value: username, href: href ?? `https://www.instagram.com/${username}`, timestamp: 1 }],
  }
}

function followingEntry({ username, href }: Entry) {
  return {
    title: username,
    string_list_data: [{ value: username, href: href ?? `https://www.instagram.com/${username}`, timestamp: 1 }],
  }
}

function followersJson(entries: Entry[]) {
  return JSON.stringify(entries.map(followerEntry))
}

function followingJson(entries: Entry[]) {
  return JSON.stringify({ relationships_following: entries.map(followingEntry) })
}

async function buildZip(files: Record<string, string>): Promise<JSZip> {
  const zip = new JSZip()
  for (const [path, contents] of Object.entries(files)) zip.file(path, contents)
  const bytes = await zip.generateAsync({ type: 'nodebuffer' })
  return JSZip.loadAsync(bytes)
}

const STANDARD = {
  followers: [{ username: 'alice' }, { username: 'bob' }],
  following: [{ username: 'alice' }, { username: 'carol' }],
}

test('standard 2023+ layout under followers_and_following/ produces correct differences', async () => {
  const zip = await buildZip({
    'followers_and_following/followers_1.json': followersJson(STANDARD.followers),
    'followers_and_following/following.json': followingJson(STANDARD.following),
  })

  const result = await analyzeZip(zip)

  assert.deepEqual(result.followers, ['alice', 'bob'])
  assert.deepEqual(result.following, ['alice', 'carol'])
  assert.deepEqual(result.notFollowingBack, ['carol'])
  assert.deepEqual(result.youDontFollowBack, ['bob'])
  assert.deepEqual(result.mutual, ['alice'])
})

test('root-level layout still works', async () => {
  const zip = await buildZip({
    'followers_1.json': followersJson(STANDARD.followers),
    'following.json': followingJson(STANDARD.following),
  })

  const result = await analyzeZip(zip)
  assert.deepEqual(result.notFollowingBack, ['carol'])
  assert.deepEqual(result.youDontFollowBack, ['bob'])
})

test('file discovery uses the basename, not the parent folder', async () => {
  const zip = await buildZip({
    'followers_and_following/followers_1.json': '[]',
    'followers_and_following/following.json': '{}',
    'followers_and_following/blocked_profiles.json': '[]',
    'followers_and_following/recently_unfollowed_profiles.json': '[]',
  })

  assert.deepEqual(findExportFiles(zip), {
    followers: ['followers_and_following/followers_1.json'],
    following: ['followers_and_following/following.json'],
  })
})

test('unsupported or unrelated files are never treated as follower data', async () => {
  const zip = await buildZip({
    'followers_and_following/followers_1.json': followersJson([{ username: 'alice' }]),
    'followers_and_following/following.json': followingJson([
      { username: 'alice' },
      { username: 'carol' },
    ]),
    'followers_and_following/blocked_profiles.json': followersJson([
      { username: 'blocked_user' },
    ]),
    'followers_and_following/recently_unfollowed_profiles.json': followersJson([
      { username: 'gone_user' },
    ]),
  })

  const result = await analyzeZip(zip)
  assert.deepEqual(result.followers, ['alice'])
  assert.deepEqual(result.notFollowingBack, ['carol'])
  assert.ok(!result.mutual.includes('blocked_user'))
})

test('missing followers file raises an error instead of reporting zero', async () => {
  const zip = await buildZip({
    'followers_and_following/following.json': followingJson([{ username: 'alice' }]),
  })

  await assert.rejects(
    () => analyzeZip(zip),
    (error: unknown) =>
      error instanceof AnalysisError && error.code === 'MISSING_FOLLOWERS',
  )
})

test('missing following file raises an error instead of reporting zero', async () => {
  const zip = await buildZip({
    'followers_and_following/followers_1.json': followersJson([{ username: 'alice' }]),
  })

  await assert.rejects(
    () => analyzeZip(zip),
    (error: unknown) =>
      error instanceof AnalysisError && error.code === 'MISSING_FOLLOWING',
  )
})

test('empty followers file is an error, not "everybody ignores you"', async () => {
  const zip = await buildZip({
    'followers_and_following/followers_1.json': '[]',
    'followers_and_following/following.json': followingJson([
      { username: 'alice' },
      { username: 'carol' },
    ]),
  })

  await assert.rejects(
    () => analyzeZip(zip),
    (error: unknown) => error instanceof AnalysisError && error.code === 'EMPTY_FOLLOWERS',
  )
})

test('split followers_1 and followers_2 files are merged and deduplicated', async () => {
  const zip = await buildZip({
    'followers_and_following/followers_1.json': followersJson([
      { username: 'alice' },
      { username: 'bob' },
    ]),
    'followers_and_following/followers_2.json': followersJson([
      { username: 'bob' },
      { username: 'dave' },
    ]),
    'followers_and_following/following.json': followingJson([
      { username: 'alice' },
      { username: 'carol' },
    ]),
  })

  const result = await analyzeZip(zip)
  assert.deepEqual(result.followers, ['alice', 'bob', 'dave'])
  assert.deepEqual(result.notFollowingBack, ['carol'])
})

test('usernames are compared case-insensitively and trimmed', async () => {
  const zip = await buildZip({
    'followers_and_following/followers_1.json': followersJson([
      { username: '  Alice ' },
      { username: 'ALICE' },
    ]),
    'followers_and_following/following.json': followingJson([{ username: 'alice' }]),
  })

  const result = await analyzeZip(zip)
  assert.deepEqual(result.followers, ['Alice'])
  assert.deepEqual(result.notFollowingBack, [])
  assert.deepEqual(result.mutual, ['Alice'])
})

test('one malformed follower file does not discard the readable ones', async () => {
  const zip = await buildZip({
    'followers_and_following/followers_1.json': followersJson([{ username: 'alice' }]),
    'followers_and_following/followers_2.json': '{ not valid json',
    'followers_and_following/following.json': followingJson([
      { username: 'alice' },
      { username: 'carol' },
    ]),
  })

  const result = await analyzeZip(zip)
  assert.deepEqual(result.followers, ['alice'])
  assert.deepEqual(result.notFollowingBack, ['carol'])
})

test('all files malformed raises UNREADABLE', async () => {
  const zip = await buildZip({
    'followers_and_following/followers_1.json': 'nope',
    'followers_and_following/following.json': 'also nope',
  })

  await assert.rejects(
    () => analyzeZip(zip),
    (error: unknown) => error instanceof AnalysisError && error.code === 'UNREADABLE',
  )
})

test('accounts without a profile link are flagged as inactive', async () => {
  const zip = await buildZip({
    'followers_and_following/followers_1.json': JSON.stringify([
      { string_list_data: [{ value: 'alice', href: 'https://www.instagram.com/alice' }] },
      { string_list_data: [{ value: 'deactivated_user' }] },
    ]),
    'followers_and_following/following.json': JSON.stringify({
      relationships_following: [
        { string_list_data: [{ value: 'alice', href: 'https://www.instagram.com/alice' }] },
        { string_list_data: [{ value: 'deactivated_user' }] },
        { string_list_data: [{ value: 'ghost', }] },
      ],
    }),
  })

  const result = await analyzeZip(zip)
  assert.deepEqual(result.inactive.followers, ['deactivated_user'])
  assert.deepEqual(result.inactive.following, ['deactivated_user', 'ghost'])
  // `deactivated_user` is in both lists, so only `ghost` is an inactive non-follower.
  assert.deepEqual(result.inactive.notFollowingBack, ['ghost'])
})

test('following entries without a value field fall back to title and profile link', async () => {
  // Shape observed in a real 2026 export: no `value`, username in `title`,
  // href pointing at the /_u/ path.
  const zip = await buildZip({
    'connections/followers_and_following/followers_1.json': JSON.stringify([
      {
        title: '',
        media_list_data: [],
        string_list_data: [{ href: 'https://www.instagram.com/alice', value: 'alice', timestamp: 1 }],
      },
    ]),
    'connections/followers_and_following/following.json': JSON.stringify({
      relationships_following: [
        {
          title: 'alice',
          string_list_data: [{ href: 'https://www.instagram.com/_u/alice', timestamp: 1 }],
        },
        {
          title: 'carol',
          string_list_data: [{ href: 'https://www.instagram.com/_u/carol', timestamp: 2 }],
        },
      ],
    }),
  })

  const result = await analyzeZip(zip)
  assert.deepEqual(result.followers, ['alice'])
  assert.deepEqual(result.following, ['alice', 'carol'])
  assert.deepEqual(result.notFollowingBack, ['carol'])
})

test('usernames are recoverable from a profile link when nothing else is present', async () => {
  const zip = await buildZip({
    'followers_and_following/followers_1.json': JSON.stringify([
      { string_list_data: [{ href: 'https://www.instagram.com/_u/href_only_user' }] },
    ]),
    'followers_and_following/following.json': JSON.stringify({
      relationships_following: [
        { string_list_data: [{ href: 'https://www.instagram.com/_u/href_only_user' }] },
      ],
    }),
  })

  const result = await analyzeZip(zip)
  assert.deepEqual(result.followers, ['href_only_user'])
  assert.deepEqual(result.mutual, ['href_only_user'])
})

test('large lists are handled and counted correctly', async () => {
  const followers = Array.from({ length: 20000 }, (_, i) => ({ username: `follower_${i}` }))
  const following = [
    ...Array.from({ length: 5000 }, (_, i) => ({ username: `follower_${i}` })),
    ...Array.from({ length: 5000 }, (_, i) => ({ username: `extra_${i}` })),
  ]

  const zip = await buildZip({
    'followers_and_following/followers_1.json': followersJson(followers),
    'followers_and_following/following.json': followingJson(following),
  })

  const result = await analyzeZip(zip)
  assert.equal(result.followers.length, 20000)
  assert.equal(result.following.length, 10000)
  assert.equal(result.mutual.length, 5000)
  assert.equal(result.notFollowingBack.length, 5000)
  assert.equal(result.youDontFollowBack.length, 15000)
})

test('analyzeArchive rejects a non-ZIP file before parsing', async () => {
  const file = new File(['hello'], 'export.json', { type: 'application/json' })
  await assert.rejects(
    () => analyzeArchive(file),
    (error: unknown) => error instanceof AnalysisError && error.code === 'NOT_A_ZIP',
  )
})

test('analyzeArchive rejects an oversized archive', async () => {
  const file = new File(['x'], 'export.zip', { type: 'application/zip' })
  Object.defineProperty(file, 'size', { value: 200 * 1024 * 1024 })
  await assert.rejects(
    () => analyzeArchive(file),
    (error: unknown) => error instanceof AnalysisError && error.code === 'TOO_LARGE',
  )
})
