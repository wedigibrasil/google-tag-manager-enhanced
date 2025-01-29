import { IOClients } from '@vtex/api'
import {
  Catalog,
  Checkout,
} from '@vtex/clients'

import { TrastyApi } from './trasty'
import { OMSEnhanced } from './omsEnhanced'

// Extend the default IOClients implementation with our own custom clients.
export class Clients extends IOClients {
  public get catalog() {
    return this.getOrSet('catalog', Catalog)
  }
  public get checkout() {
    return this.getOrSet('checkout', Checkout)
  }
  public get TrastyApi() {
    return this.getOrSet('TrastyApi', TrastyApi)
  }
  public get OMSEnhanced() {
    return this.getOrSet('OMSEnhanced', OMSEnhanced)
  }
}
