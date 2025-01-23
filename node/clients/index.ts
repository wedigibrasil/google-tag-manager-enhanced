import { IOClients } from '@vtex/api'
import {
  Checkout,
  OMS
} from '@vtex/clients'

import { TrastyApi } from './trasty'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {

  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }
  public get OMS() {
    return this.getOrSet('OMS', OMS)
  }
  public get TrastyApi() {
    return this.getOrSet('TrastyApi', TrastyApi)
  }
}
