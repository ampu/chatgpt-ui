export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', async () => {
    useApiKey().value = getApiKey()
  })
})
