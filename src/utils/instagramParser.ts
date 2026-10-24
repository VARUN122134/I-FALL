import JSZip from 'jszip'

export interface AnalysisResult {
  followers: string[]
  following: string[]
  notFollowingBack: string[]
  youDontFollowBack: string[]
  mutual: string[]
}

function extractUsernamesFromData(data: any): string[] {
  const usernames = new Set<string>()
  
  if (!data) return []
  
  // Handle array format
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === 'object') {
        if (item.string_list_data && Array.isArray(item.string_list_data)) {
          for (const entry of item.string_list_data) {
            if (entry && entry.value) {
              usernames.add(entry.value.trim().toLowerCase())
            }
          }
        } else if (item.value) {
          usernames.add(String(item.value).trim().toLowerCase())
        } else if (item.username) {
          usernames.add(String(item.username).trim().toLowerCase())
        }
      } else if (typeof item === 'string') {
        usernames.add(item.trim().toLowerCase())
      }
    }
  } else if (typeof data === 'object') {
    // Check for string_list_data directly
    if (data.string_list_data && Array.isArray(data.string_list_data)) {
      for (const entry of data.string_list_data) {
        if (entry && entry.value) {
          usernames.add(entry.value.trim().toLowerCase())
        }
      }
    }
    // Check other common patterns
    if (data.users && Array.isArray(data.users)) {
      for (const user of data.users) {
        if (user.username) usernames.add(String(user.username).trim().toLowerCase())
        else if (user.value) usernames.add(String(user.value).trim().toLowerCase())
      }
    }
    if (data.followers && Array.isArray(data.followers)) {
      for (const user of data.followers) {
        if (user.username) usernames.add(String(user.username).trim().toLowerCase())
        else if (user.value) usernames.add(String(user.value).trim().toLowerCase())
      }
    }
    if (data.following && Array.isArray(data.following)) {
      for (const user of data.following) {
        if (user.username) usernames.add(String(user.username).trim().toLowerCase())
        else if (user.value) usernames.add(String(user.value).trim().toLowerCase())
      }
    }
    // Search recursively for string_list_data
    const search = (obj: any) => {
      if (!obj || typeof obj !== 'object') return
      if (Array.isArray(obj)) {
        obj.forEach(search)
        return
      }
      if (obj.string_list_data && Array.isArray(obj.string_list_data)) {
        for (const entry of obj.string_list_data) {
          if (entry && entry.value) {
            usernames.add(entry.value.trim().toLowerCase())
          }
        }
      }
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && key !== 'string_list_data') {
          search(obj[key])
        }
      }
    }
    search(data)
  }
  
  return Array.from(usernames).filter(u => u && u.length > 0)
}

export async function analyzeInstagramData(zip: JSZip): Promise<AnalysisResult> {
  let followers: string[] = []
  let following: string[] = []
  
  // Look for followers files
  const followerFiles = Object.keys(zip.files).filter(name => {
    const lower = name.toLowerCase()
    const isNotDir = !zip.files[name].dir
    return isNotDir && ((lower.includes('follower') && lower.endsWith('.json')) || 
           (lower.includes('followers') && lower.endsWith('.json')))
  })
  
  // Look for following files
  const followingFiles = Object.keys(zip.files).filter(name => {
    const lower = name.toLowerCase()
    const isNotDir = !zip.files[name].dir
    return isNotDir && (lower.includes('following') && lower.endsWith('.json'))
  })
  
  // Parse followers
  for (const fileName of followerFiles) {
    try {
      const file = zip.files[fileName]
      const content = await file.async('string')
      const data = JSON.parse(content)
      const extracted = extractUsernamesFromData(data)
      followers = followers.concat(extracted)
    } catch (e) {
      console.error('Error parsing follower file:', fileName, e)
    }
  }
  
  // Parse following
  for (const fileName of followingFiles) {
    try {
      const file = zip.files[fileName]
      const content = await file.async('string')
      const data = JSON.parse(content)
      const extracted = extractUsernamesFromData(data)
      following = following.concat(extracted)
    } catch (e) {
      console.error('Error parsing following file:', fileName, e)
    }
  }
  
  // Deduplicate
  followers = Array.from(new Set(followers))
  following = Array.from(new Set(following))
  
  const followerSet = new Set(followers)
  const followingSet = new Set(following)
  
  const notFollowingBack = following.filter(f => !followerSet.has(f)).sort()
  const youDontFollowBack = followers.filter(f => !followingSet.has(f)).sort()
  const mutual = followers.filter(f => followingSet.has(f)).sort()
  
  return {
    followers,
    following,
    notFollowingBack,
    youDontFollowBack,
    mutual
  }
}
