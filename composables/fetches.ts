type FetchOptions = Record<string, unknown>

export const useJsonFetch = (url: string, options: FetchOptions = {}) => {
  return useFetch(url, {
    baseURL: process.env?.SERVER_DOMAIN,
    headers: {
      Accept: 'application/json'
    },
    ...options,
  })
}

export const useAuthFetch = async (url: string, options: FetchOptions = {}) => {
  const res = await useJsonFetch(url, options)
  if (res.error.value?.status === 401) {
    await logout()
  }
  return res
}
