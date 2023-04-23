import { type HAP, type Logging, type Service } from 'homebridge'

import {
  getCurrentHeatingState,
  getCurrentTemperature,
  getTargetTemperature,
  setTargetHeatingState,
  setTargetTemperature
} from '../api/home.js'

export class Thermostat {
  private readonly log: Logging
  private readonly name: string

  private readonly thermostatService: Service
  private readonly informationService: Service
  private readonly hap: HAP

  private readonly homeId: string

  constructor({
    hap,
    log,
    homeId
  }: {
    hap: HAP
    log: Logging
    homeId: string
  }) {
    this.name = 'Cosa Thermostat'
    this.log = log
    this.hap = hap
    this.homeId = homeId

    this.thermostatService = new hap.Service.Thermostat(this.name)

    this.thermostatService
      .getCharacteristic(hap.Characteristic.CurrentHeatingCoolingState)
      .setProps({
        validValues: [
          hap.Characteristic.CurrentHeatingCoolingState.OFF,
          hap.Characteristic.CurrentHeatingCoolingState.HEAT
        ]
      })
      .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this))

    this.thermostatService
      .getCharacteristic(hap.Characteristic.TargetHeatingCoolingState)
      .setProps({
        validValues: [
          hap.Characteristic.TargetHeatingCoolingState.OFF,
          hap.Characteristic.TargetHeatingCoolingState.AUTO
        ]
      })
      .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
      // @ts-expect-error - TODO
      .onSet(this.handleTargetHeatingCoolingStateSet.bind(this))

    this.thermostatService
      .getCharacteristic(hap.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this))

    this.thermostatService
      .getCharacteristic(hap.Characteristic.TargetTemperature)
      .setProps({
        minValue: 5,
        maxValue: 32,
        minStep: 0.1
      })
      .onGet(this.handleTargetTemperatureGet.bind(this))
      // @ts-expect-error - TODO
      .onSet(this.handleTargetTemperatureSet.bind(this))

    this.thermostatService
      .getCharacteristic(hap.Characteristic.TemperatureDisplayUnits)
      .onGet(this.handleTemperatureDisplayUnitsGet.bind(this))
      // @ts-expect-error - TODO
      .onSet(this.handleTemperatureDisplayUnitsSet.bind(this))

    this.informationService = new hap.Service.AccessoryInformation()
      .setCharacteristic(hap.Characteristic.Manufacturer, 'Cosa')
      .setCharacteristic(hap.Characteristic.Model, 'v4')

    log.info('Thermostat finished initializing!')
  }

  identify(): void {
    this.log('Identified.')
  }

  getServices(): Service[] {
    return [this.informationService, this.thermostatService]
  }

  /**
   * Handle requests to get the current value of the "Current Heating Cooling State" characteristic
   */
  async handleCurrentHeatingCoolingStateGet(): Promise<number> {
    this.log.debug('Triggered GET CurrentHeatingCoolingState')

    const { OFF, HEAT } = this.hap.Characteristic.CurrentHeatingCoolingState

    const isHeating = await getCurrentHeatingState({
      homeId: this.homeId
    })

    const currentValue = isHeating ? HEAT : OFF

    this.log.debug('Heating state is', isHeating, currentValue)

    return currentValue
  }

  /**
   * Handle requests to get the current value of the "Target Heating Cooling State" characteristic
   */
  async handleTargetHeatingCoolingStateGet(): Promise<number> {
    this.log.debug('Triggered GET TargetHeatingCoolingState')

    const { OFF, AUTO } = this.hap.Characteristic.TargetHeatingCoolingState

    const isHeating = await getCurrentHeatingState({
      homeId: this.homeId
    })

    const currentValue = isHeating ? AUTO : OFF

    this.log.debug('Target heating state is', isHeating, currentValue)

    return currentValue
  }

  /**
   * Handle requests to set the "Target Heating Cooling State" characteristic
   */
  async handleTargetHeatingCoolingStateSet(value: 0 | 3): Promise<void> {
    this.log.debug('Triggered SET TargetHeatingCoolingState:', value)

    const { OFF, AUTO } = this.hap.Characteristic.TargetHeatingCoolingState
    const states = {
      [OFF]: 'off',
      [AUTO]: 'on'
    }

    this.log.debug('Setting target heating state to', states[value])

    await setTargetHeatingState({
      homeId: this.homeId,
      targetState: states[value]
    })
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  async handleCurrentTemperatureGet(): Promise<number> {
    this.log.debug('Triggered GET CurrentTemperature')

    const currentValue = await getCurrentTemperature({
      homeId: this.homeId
    })
    this.log.debug('Current value is', currentValue)

    return currentValue
  }

  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  async handleTargetTemperatureGet(): Promise<number> {
    this.log.debug('Triggered GET TargetTemperature')

    const currentValue = await getTargetTemperature({
      homeId: this.homeId
    })
    this.log.debug('Target temperature is', currentValue)

    return currentValue
  }

  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  async handleTargetTemperatureSet(value: number): Promise<void> {
    this.log.debug('Triggered SET TargetTemperature:', value)

    this.log.debug('Setting target temperature to', value)

    await setTargetTemperature({
      homeId: this.homeId,
      targetTemperature: value
    })
  }

  /**
   * Handle requests to get the current value of the "Temperature Display Units" characteristic
   */
  handleTemperatureDisplayUnitsGet(): number {
    this.log.debug('Triggered GET TemperatureDisplayUnits')

    // set this to a valid value for TemperatureDisplayUnits
    const currentValue = this.hap.Characteristic.TemperatureDisplayUnits.CELSIUS
    this.log.debug('handleTemperatureDisplayUnitsGet', currentValue)

    return currentValue
  }

  /**
   * Handle requests to set the "Temperature Display Units" characteristic
   */
  handleTemperatureDisplayUnitsSet(value: number): void {
    this.log.debug('Triggered SET TemperatureDisplayUnits:', value)
  }
}
