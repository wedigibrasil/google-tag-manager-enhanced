import {
  OrderFormConfiguration,
  App
} from "@vtex/clients"

export async function setupAppConfiguration (ctx: InstalledAppEvent, next: () => Promise<any>)  {

  const {
    checkout
  } = ctx.clients

  try
  {
    const currentOrderFormConfig: OrderFormConfiguration = await checkout.getOrderFormConfiguration()

    // Verifica se o ID "trasty-data" já existe no array "apps"
    const trastyDataApp = currentOrderFormConfig.apps?.find(app => app.id === 'trasty-data')

    if (!trastyDataApp) {
      // Cria o objeto para "trasty-data"
      const trastyDataNewApp: App = {
        id: 'trasty-data',
        major: 1,
        fields: ["ga4clientid", "ga4sessionid"]
      }

      // Adiciona o novo app ao array "apps"
      currentOrderFormConfig.apps = [...(currentOrderFormConfig.apps || []), trastyDataNewApp]

      try
      {
        await checkout.setOrderFormConfiguration(currentOrderFormConfig)
      }
      catch(error)
      {
        ctx.vtex.logger.error({
          setupAppConfigurationError: {
            status: 'failed',
            content: error,
          },
        })
        throw new Error("Couldn't set orderform configuration")
      }
    }
  }
  catch (error)
  {
    console.log(error)
    ctx.vtex.logger.error({
      setupAppConfigurationError: {
        status: 'failed',
        content: error,
      },
    })
    throw new Error("Couldn't set orderform configuration")
  }

  await next()
}
