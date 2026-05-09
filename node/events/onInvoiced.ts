import { IAppSettings, EnchancedOrderDetailResponse } from "../@types/types"


export async function onInvoiced(ctx: OrderStatusChangeContext, next: () => Promise<any>) {

  const {
    clients: { OMSEnhanced, apps, TrastyApi },
    vtex: { logger }
  } = ctx

  // Pega as informações do App
  const appSettings: IAppSettings = await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
  )

  const trastyApiKey = appSettings.apiKey
  const trastyApiUrl = appSettings.apiUrl || 'https://pipeline.trasty.io'

  // Skip silencioso se apiKey não configurada
  if (!trastyApiKey || trastyApiKey.trim().length === 0) {
    await next()
    return
  }

  const orderId = ctx.body.orderId

  try {
    const orderDetail: EnchancedOrderDetailResponse = await OMSEnhanced.orderFull(orderId)

    // Extrair dados da nota fiscal do packageAttachment
    const packages = (orderDetail as any).packageAttachment?.packages
    const invoiceNumber = packages?.[0]?.invoiceNumber
    const invoiceKey = packages?.[0]?.invoiceKey

    if (!invoiceNumber) {
      logger.warn({ trastyInvoiced: { orderId, status: 'no_invoice_number_found' } })
      await next()
      return
    }

    const trastyResp = await TrastyApi.sendOrderEvent({
      apiKey: trastyApiKey,
      apiUrl: trastyApiUrl,
      eventName: 'order_invoiced',
      orderDetail,
      invoiceData: { invoiceNumber, invoiceKey },
    })

    logger.info({ trastyInvoiced: { orderId, invoiceNumber, status: 'sent', response: trastyResp } })
  } catch (error) {
    if (error?.response?.status === 409) {
      logger.info({ trastyInvoiced: { orderId, status: 'duplicate_skipped' } })
    } else {
      logger.warn({ trastyInvoicedError: { orderId, error: error?.message } })
    }
  }

  await next()
}
