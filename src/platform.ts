import {
  type AccessoryPlugin,
  type API,
  type Logging,
  type PlatformConfig,
  type StaticPlatformPlugin
} from 'homebridge'

import { Thermostat } from './accessories/index.js'
import { login } from './api/auth.js'
import { getHomeList } from './api/home.js'

interface CosaPlatformConfigType extends PlatformConfig {
  email: string
  password: string
}

export class CosaPlatform implements StaticPlatformPlugin {
  private readonly log: Logging
  private readonly config: CosaPlatformConfigType
  private readonly api: API

  private homeId: string | null = null

  constructor(log: Logging, config: CosaPlatformConfigType, api: API) {
    this.log = log
    this.config = config
    this.api = api

    // probably parse config or something here
    log.info('Cosa platform finished initializing!')
  }

  /*
   * This method is called to retrieve all accessories exposed by the platform.
   * The Platform can delay the response my invoking the callback at a later time,
   * it will delay the bridge startup though, so keep it to a minimum.
   * The set of exposed accessories CANNOT change over the lifetime of the plugin!
   */
  async accessories(
    register: (foundAccessories: AccessoryPlugin[]) => void
  ): Promise<void> {
    this.log.debug(JSON.stringify(this.config))

    const { email, password } = this.config

    const loggedIn = await login({
      email,
      password
    })

    if (!loggedIn) {
      this.log.error('Unable to login.')
      return
    }

    const homeList = await getHomeList()

    if (homeList[0] === undefined) {
      this.log.error('Home is not available to register the thermostat.')
      return
    }

    this.homeId = homeList[0].id

    this.log.info(`Logged in ${this.homeId}.`)

    const thermostat = new Thermostat({
      hap: this.api.hap,
      log: this.log,
      homeId: this.homeId
    })

    register([thermostat])
  }
}
