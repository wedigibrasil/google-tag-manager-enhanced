import { CustomApps } from "@vtex/clients"
import { EnchancedOrderDetailResponse, IAppSettings } from "../@types/types"

import { createPublicKey, publicEncrypt, constants } from "crypto"


export async function onPaymentApproved(ctx: OrderStatusChangeContext, next: () => Promise<any>) {

  const {
    clients: {OMSEnhanced, apps, TrastyApi},
    vtex: {logger}
  } = ctx

  // Pega as informações do App
  const appSettings : IAppSettings = await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
  )

  const orderId = ctx.body.orderId

  // Carrega o orderDetail sempre — usado tanto pelo GA4 quanto pelo Trasty
  const orderDetail: EnchancedOrderDetailResponse = await OMSEnhanced.orderFull(orderId)

  // ── GA4 Server-Side Tracking (existente) ──
  if (appSettings.sendOrderPlacedOnServerSide)
  {
    // Verifica se as informações de Métrica e
    if ((!appSettings.ga4PropertyId || !appSettings.ga4MeasurementProtocolAPI) ||
        (appSettings.ga4PropertyId.trim().length == 0 || appSettings.ga4MeasurementProtocolAPI.trim().length == 0))
        {
          throw new Error("Measurement ID and API Secret is required")
        }

    // Log do status
    console.log(ctx.body)
    logger.debug(ctx.body)

    // Log do Detalhe do Pedido
    console.log(orderDetail)
    logger.info(orderDetail)

    const orderCustomData = orderDetail.customData

    if (orderCustomData?.customApps && orderCustomData.customApps.length > 0)
      {
          orderCustomData.customApps.forEach (async (element: CustomApps) => {
              if (element?.id && element.id == 'trasty-data')
              {
                  console.log(element);
                  if (element.fields?.ga4clientid && element.fields?.ga4clientid.trim().length > 0)
                  {
                      const ga4clientid = element.fields?.ga4clientid
                      const domain_url = appSettings.transportUrl
                      const ga4MeasurementId = appSettings.ga4PropertyId
                      const ga4MeasurementAppSecret = appSettings.ga4MeasurementProtocolAPI
                      const ga4SessionId = element.fields?.ga4sessionid
                      const _fbp = element.fields?.fbp || '---'
                      const _fbc = element.fields?.fbc || '---'

                      //let splitCookieValue = ''
                      //let sessionNumber = ''

                      //if (ga4SessionId.trim().length > 0)
                      //{
                        //splitCookieValue = ga4SessionId.split('.');
                      //  sessionNumber = ga4SessionId;
                      //}

                      // Pega a chave de API
                      const secret = ga4MeasurementAppSecret// "8REzfa7fT2ibChSPtRttyQ"
                      const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2RzUUyrzcuDtHyPGODUp
IeG0Nqk0gbVV730BbpEsRqq5/HjHCxwVpvEPOvcsgqp+9GwrjXHYB+OlG4J+Or96
g3V3nkuinRVhGPHIqbtatX3vzI3TE+Mrhw76DbyydU2lSOmnrSSjFMlcfbsBTIBR
+m3krPk3n4rcxwphpAlMcHRxGzN87oNRJ68g40Kgg+WJ42NSH4lHuqtE8OAnaJii
WBtPNsUnYeogNHS2GiWsCR15R3M6g4VVy/afd7IF3Y58yDBPl4M9EBkda0gRihEa
1cXoVhLjzeyTmC90XlPpDf+PHUxqy+1ZLmCuLiFaTEBsEM331hd5N8ij9LrrxeI2
ewIDAQAB
-----END PUBLIC KEY-----`;

                      const key = createPublicKey(publicKey);
                      const encrypted = publicEncrypt(
                          {
                              key,
                              padding: constants.RSA_PKCS1_OAEP_PADDING,
                              oaepHash: 'sha256',
                          },
                          Buffer.from(secret)
                      );

                      const resp = await TrastyApi.ecommerceTrackPurchase(ga4clientid, ga4SessionId, domain_url, ga4MeasurementId, encrypted.toString('base64'), _fbp, _fbc, orderDetail)

                      logger.info(resp)
                      console.log(resp)

                  }
              }
          })
      }
  }

  // ── Trasty order_approved (independente do GA4) ──
  try {
    const trastyApiKey = appSettings.apiKey
    const trastyApiUrl = appSettings.apiUrl || 'https://pipeline.trasty.io'

    if (trastyApiKey && trastyApiKey.trim().length > 0) {
      const trastyResp = await TrastyApi.sendOrderEvent({
        apiKey: trastyApiKey,
        apiUrl: trastyApiUrl,
        eventName: 'order_approved',
        orderDetail,
      })
      logger.info({ trastyOrderApproved: { orderId, status: 'sent', response: trastyResp } })
    }
  } catch (trastyError) {
    if (trastyError?.response?.status === 409) {
      logger.info({ trastyOrderApproved: { orderId, status: 'duplicate_skipped' } })
    } else {
      logger.warn({ trastyOrderApprovedError: { orderId, error: trastyError?.message } })
    }
  }

  await next()

}
