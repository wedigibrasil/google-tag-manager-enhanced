import type {
  InstanceOptions,
  IOContext,
  RequestTracingConfig
} from '@vtex/api'

import { OMS } from '@vtex/clients'
import { getRequestConfig } from '../utils/request-helpers'

import { EnchancedOrderDetailResponse } from '../@types/types'

const baseURL = '/api/oms'

const routesEnhanced = {
  orderFull: (id: string) => `${baseURL}/pvt/orders/${id}`
}

export class OMSEnhanced extends OMS {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
    })
  }

  public orderFull(
    id: string,
    tracingConfig?: RequestTracingConfig
  ) {
    const metric = 'oms-order-full'

    return this.http.get<EnchancedOrderDetailResponse>(
      routesEnhanced.orderFull(id),
      getRequestConfig(this.context, metric, tracingConfig)
    )
  }
}
