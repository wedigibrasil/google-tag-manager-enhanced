import type { IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

import { EnchancedOrderDetailResponse } from '../@types/types'

const routes = {
  ecommerceTrackPurchase: () => `/v1/ecommerce/track/purchase`
}

export class TrastyApi extends ExternalClient {
  constructor(context: IOContext) {
    super('https://api.trasty.io', context, {timeout: 100000,  retries: 0, concurrency: 0})
  }

  public async ecommerceTrackPurchase(ga4ClientId: string, ga4SessionID: string, domainUrl: string, ga4MeasurementId: string,
    ga4ApiSecret: string, metaFBP: string, metaFBC: string, orderDetail: EnchancedOrderDetailResponse) {

    // Construir os itens do pedido com base no orderDetail
    const items = orderDetail.items.map((item) => {

      let priceFormatted = item.price / 100

      // Extraindo as categorias conforme a ordem especificada em categoriesIds
      const categoryIds = item.additionalInfo.categoriesIds
      .split("/")
      .filter((id) => id.trim() !== "");

      const categoriesMap = new Map(
        item.additionalInfo.categories.map((cat) => [String(cat.id), cat.name])
      );

      // Mapeando as categorias disponíveis para os campos correspondentes mantendo a ordem de categoriesIds
      const mappedCategories = categoryIds.map((id) => categoriesMap.get(id) || "");

      return {
        item_id: item.productId, // Substitua pelo campo correspondente em orderDetail
        item_name: item.name, // Substitua pelo campo correspondente em orderDetail
        price: priceFormatted, // Substitua pelo campo correspondente em orderDetail
        quantity: item.quantity, // Substitua pelo campo correspondente em orderDetail
        currency: "BRL", // Assumindo que o currency está em orderDetail
        item_brand: item.additionalInfo.brandName, // Substitua pelo campo correspondente, se existir
        item_category: mappedCategories[0] || undefined,
        item_category2: mappedCategories[1] || undefined,
        item_category3: mappedCategories[2] || undefined,
        item_category4: mappedCategories[3] || undefined,
        item_category5: mappedCategories[4] || undefined,
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

    const ecommerceDatetime = orderDetail.creationDate;
    // Criando um objeto Date com o timestamp atual
    const date = new Date(ecommerceDatetime);
    // Ajustando para GMT+3 (Brasília)
    const adjustedDate = new Date(date.getTime() - (3 * 60 * 60 * 1000));
    // Formatando a data para o formato desejado
    const formattedDatetime = adjustedDate.toISOString();

    const payloadBody = {
      ecommerce_event_id : 0,
      client_id: ga4ClientId,
      platform: "VTEX",
      client_profile : orderDetail.clientProfileData,
      domain_url: domainUrl,
      timestamp: formattedDatetime,
      ga4_measurement_id: ga4MeasurementId,
      ga4_api_secret: ga4ApiSecret,
      fbp: metaFBP,
      fbc: metaFBC,
      events: [{
        name: "purchase",
        params
      }]
    }

    console.log(payloadBody)

    const callUrl = routes.ecommerceTrackPurchase()
    return await this.http.post(callUrl,payloadBody)
  }

  public async testApi()
  {
    return this.http.get("/hello")
  }
}
