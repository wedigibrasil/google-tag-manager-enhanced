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


    // Encontra o index do trasty-data no array de apps
    const trastyDataAppIndex = currentOrderFormConfig.apps?.findIndex(app => app.id === 'trasty-data')

    console.log('Trasty Data: Current Order Form Configuration - ', currentOrderFormConfig);
    console.log('Trasty Data: Trasty Data App Index - ', trastyDataAppIndex);

    let needsUpdate = false;
    const requiredFields = ["ga4clientid", "ga4sessionid", "fbc", "fbp"];

    // Se o App não existir, nós criamos
    if (trastyDataAppIndex === undefined || trastyDataAppIndex === -1) {
      const trastyDataNewApp: App = {
        id: 'trasty-data',
        major: 1,
        fields: requiredFields,
      }
      currentOrderFormConfig.apps = [...(currentOrderFormConfig.apps || []), trastyDataNewApp]
      needsUpdate = true;
    }
    // Se o App existir, verificamos se todos os campos necessários já estão lá
    else {
      const existingApp = currentOrderFormConfig.apps![trastyDataAppIndex];
      const currentFields = existingApp.fields ||[];

      console.log('Trasty Data: Current Fields in App - ', currentFields);

      const hasAllFields = requiredFields.every(field => currentFields.includes(field));

      if (!hasAllFields) {
        // Junta os campos que já existiam com os novos, usando Set para evitar duplicatas
        existingApp.fields = Array.from(new Set([...currentFields, ...requiredFields]));
        needsUpdate = true;
      }
    }

    // Só dispara a requisição pra VTEX se houver necessidade (novo app ou atualização de campos)
    if (needsUpdate) {
      try {
        await checkout.setOrderFormConfiguration(currentOrderFormConfig)
      }
      catch(error) {
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
