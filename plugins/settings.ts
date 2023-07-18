const transformData = (list: Array<{ name: string, value: string }>) => {
  const result: Record<string, string> = {}
  for (const item of list) {
    result[item.name] = item.value
  }
  return result
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', async () => {
    let settings = {}

    const {data, error} = await useAuthFetch('/api/chat/settings/', {
      method: 'GET',
    })

    if (!error.value) {
      settings = transformData(data.value as any)
    }

    nuxtApp.provide('settings', settings)
  })
})
