import { CustomApps } from "@vtex/clients"
import { EnchancedOrderDetailResponse, IAppSettings } from "../@types/types"

import { createPublicKey, publicEncrypt, constants } from "crypto"


export async function onTest(ctx: Context, next: () => Promise<any>) {

  const {
    clients: {OMSEnhanced, apps, TrastyApi}
  } = ctx

  // Pega as informações do App
  const appSettings : IAppSettings = await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
  )

  if (appSettings.sendOrderPlacedOnServerSide)
  {
    // Verifica se as informações de Métrica e
    if ((!appSettings.ga4PropertyId || !appSettings.ga4MeasurementProtocolAPI) ||
        (appSettings.ga4PropertyId.trim().length == 0 || appSettings.ga4MeasurementProtocolAPI.trim().length == 0))
        {
          throw new Error("Measurement ID and API Secret is required")
        }


    const orderId = "1506810592915-01"
    const orderDetail: EnchancedOrderDetailResponse = await OMSEnhanced.orderFull(orderId)

    // Log do Detalhe do Pedido
    console.log(orderDetail)
    console.log(orderDetail.items[0].additionalInfo)

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

                      //let splitCookieValue = ''
                      //let sessionNumber = ''

                      //if (ga4SessionId.trim().length > 0)
                      //{
                        //splitCookieValue = ga4SessionId.split('.');
                        //sessionNumber = splitCookieValue[2];
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

                      try
                      {
                        const resp2 = await TrastyApi.ecommerceTrackPurchase(ga4clientid, ga4SessionId, domain_url, ga4MeasurementId, encrypted.toString('base64'), orderDetail)
                        console.log(resp2)
                      }
                      catch (error)
                      {
                        console.log(error)
                      }



                  }
              }
          })
      }

    await next()
  }

}
