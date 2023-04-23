import { type API } from 'homebridge'

import { PLATFORM_NAME } from './settings.js'
import { CosaPlatform } from './platform.js'

export default function (api: API): void {
  // @ts-expect-error TODO
  api.registerPlatform(PLATFORM_NAME, CosaPlatform)
}
