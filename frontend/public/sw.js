const CACHE_NAME = 'mirrorlingo-v1'
const urlsToCache = [
  '/',
  '/manifest.json',
  // Add other static assets as needed
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Background sync for offline phrase storage
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-phrases') {
    event.waitUntil(syncPhrases())
  }
})

async function syncPhrases() {
  // Sync offline phrases when connection is restored
  const offlinePhrases = await getOfflinePhrases()
  if (offlinePhrases.length > 0) {
    try {
      await uploadPhrases(offlinePhrases)
      await clearOfflinePhrases()
    } catch (error) {
      console.error('Failed to sync phrases:', error)
    }
  }
}

async function getOfflinePhrases() {
  // Get phrases stored offline
  return []
}

async function uploadPhrases(phrases) {
  // Upload phrases to server
  return fetch('/api/phrases', {
    method: 'POST',
    body: JSON.stringify({ phrases })
  })
}

async function clearOfflinePhrases() {
  // Clear offline storage
}
