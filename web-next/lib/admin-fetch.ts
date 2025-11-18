/**
 * Helper function to make authenticated admin API requests
 * Automatically includes admin token and handles 400/401 errors with logout
 */
export async function adminFetch(
  url: string,
  options: RequestInit = {},
  onUnauthorized?: () => void
): Promise<Response> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null

  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 400/401 errors with automatic logout
  if (response.status === 400 || response.status === 401) {
    if (typeof window !== 'undefined' && onUnauthorized) {
      sessionStorage.removeItem('admin_token')
      sessionStorage.removeItem('dashboard_auth')
      onUnauthorized()
    }
  }

  return response
}

