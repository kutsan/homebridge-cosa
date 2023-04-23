import { api } from './index.js'
import { z } from 'zod'

const LoginResponseSchema = z.object({
  authToken: z.string()
})

export async function login({
  email,
  password
}: {
  email: string
  password: string
}): Promise<boolean> {
  try {
    const response = await api.post('/users/login', {
      email,
      password
    })

    const parsedResponse = LoginResponseSchema.safeParse(response.data)

    if (parsedResponse.success) {
      api.defaults.headers.common['authToken'] = parsedResponse.data.authToken

      return true
    }

    return false
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)

    return false
  }
}
