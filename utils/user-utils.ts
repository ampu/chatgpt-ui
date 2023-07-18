export type User = {
  username: string,
  email: string,
}

export const fetchUser = async () => {
  return useJsonFetch(ApiPath.USER)
}

export const setUser = (newUser: User) => {
  useUser().value = newUser
}

export const logout = async () => {
  useUser().value = null
  return navigateTo(LocalPath.SIGN_IN)
}
