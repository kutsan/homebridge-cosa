import { api } from './index.js'
import { z } from 'zod'

const HomeSchema = z.object({
  combiState: z.enum(['on', 'off']),
  temperature: z.number(),
  targetTemperature: z.number()
})

const HomeResponseSchema = z.object({
  endpoint: HomeSchema
})

const HomeListSchema = z.array(
  z.object({
    id: z.string()
  })
)

type HomeType = z.infer<typeof HomeSchema>
type HomeListType = z.infer<typeof HomeListSchema>

const HomeListResponseSchema = z.object({
  endpoints: HomeListSchema
})

export async function getHomeList(): Promise<HomeListType> {
  try {
    const response = await api.get('/endpoints/getEndpoints')

    const parsedResponse = HomeListResponseSchema.safeParse(response.data)

    if (parsedResponse.success) {
      return parsedResponse.data.endpoints
    }

    return []
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)

    return []
  }
}

export async function getHome({
  homeId
}: {
  homeId: string
}): Promise<HomeType | null> {
  try {
    const response = await api.post('/endpoints/getEndpoint', {
      endpoint: homeId
    })

    const parsedResponse = HomeResponseSchema.safeParse(response.data)

    if (parsedResponse.success) {
      return parsedResponse.data.endpoint
    }

    return null
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)

    return null
  }
}

export async function getCurrentTemperature({
  homeId
}: {
  homeId: string
}): Promise<number> {
  const house = await getHome({
    homeId
  })

  if (house !== null) {
    return house.temperature
  }

  return 5
}

export async function getCurrentHeatingState({
  homeId
}: {
  homeId: string
}): Promise<boolean> {
  const house = await getHome({
    homeId
  })

  return house?.combiState === 'on'
}

export async function getTargetTemperature({
  homeId
}: {
  homeId: string
}): Promise<number> {
  const house = await getHome({
    homeId
  })

  if (house !== null) {
    return house.targetTemperature
  }

  return 5
}

export async function setTargetTemperature({
  homeId,
  targetTemperature
}: {
  homeId: string
  targetTemperature: number
}): Promise<void> {
  try {
    await api.post(`/endpoints/setTargetTemperatures`, {
      endpoint: homeId,
      targetTemperatures: {
        home: targetTemperature,
        away: 5,
        sleep: 5,
        custom: 5
      }
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

export async function setTargetHeatingState({
  homeId,
  targetState
}: {
  homeId: string
  targetState: string
}): Promise<void> {
  try {
    await api.post(`/endpoints/setMode`, {
      endpoint: homeId,
      mode: 'manual',
      option: targetState === 'off' ? 'frozen' : 'home'
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}
