export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useUser()
  if (!user.value && to.path !== LocalPath.SIGN_IN) {
    const {error, data} = await fetchUser()
    if (error.value) {
      return navigateTo({
        path: LocalPath.SIGN_IN,
        query: {
          callback: encodeURIComponent(to.fullPath)
        }
      })
    }
    setUser(data.value)
  }
})
