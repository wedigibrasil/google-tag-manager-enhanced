import type { IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import { OrderDetailResponse } from '@vtex/clients'

const routes = {
  ecommerceTrackPurchase: () => `/v1/ecommerce/track/purchase`
}

export class TrastyApi extends ExternalClient {
  constructor(context: IOContext) {
    super('https://api.trasty.io', context, {timeout: 30000})
  }

  public async ecommerceTrackPurchase(ga4ClientId: string, ga4SessionID: string, domainUrl: string, ga4MeasurementId: string,
    ga4ApiSecret: string, orderDetail: OrderDetailResponse) {

    // Construir os itens do pedido com base no orderDetail
    const items = orderDetail.items.map((item) => {

      let priceFormatted = item.price / 100

      return {
        item_id: item.productId, // Substitua pelo campo correspondente em orderDetail
        item_name: item.name, // Substitua pelo campo correspondente em orderDetail
        price: priceFormatted, // Substitua pelo campo correspondente em orderDetail
        quantity: item.quantity, // Substitua pelo campo correspondente em orderDetail
        currency: "BRL", // Assumindo que o currency está em orderDetail
        item_brand: item.additionalInfo.brandName, // Substitua pelo campo correspondente, se existir
        item_category: "", // Substitua pelo campo correspondente, se existir,
        item_variant: item.id,
        discount: 0, // Desconto, se aplicável
      }
    });

    let orderValueFormated = orderDetail.value / 100

    let shippingValueFormated

    if (orderDetail.shippingData && orderDetail.shippingData.logisticsInfo &&
      orderDetail.shippingData.logisticsInfo.length > 0 && orderDetail.shippingData.logisticsInfo[0].price > 0)
      {
        shippingValueFormated = orderDetail.shippingData.logisticsInfo[0].price / 100
      }
      else
      {
        shippingValueFormated = 0
      }



    // Montar o objeto params
    const params = {
      session_id : ga4SessionID,
      engagement_time_msec: "100",
      currency: "BRL", // Substitua pelo campo correspondente
      transaction_id: orderDetail.orderId, // Substitua pelo campo correspondente
      value: orderValueFormated, // Valor total do pedido
      coupon: "", // Código do cupom, se existir
      shipping:  shippingValueFormated, // Custo de envio, se aplicável
      tax: 0, // Impostos, se aplicável
      items,
    };

    const payloadBody = {
      ecommerce_event_id : 0,
      client_id: ga4ClientId,
      platform: "VTEX",
      domain_url: domainUrl,
      timestamp: orderDetail.creationDate,
      ga4_measurement_id: ga4MeasurementId,
      ga4_api_secret: ga4ApiSecret,
      events: [{
        name: "purchase",
        params
      }]
    }

    console.log(payloadBody)

    const callUrl = routes.ecommerceTrackPurchase()

    return this.http.post(callUrl,payloadBody)

  }

  public async testApi()
  {
    return this.http.get("/hello")
  }
}
