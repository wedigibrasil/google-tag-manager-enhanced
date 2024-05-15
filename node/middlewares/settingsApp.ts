import { IAppSettings } from "../@types/types"

export async function settingsApp(ctx: Context, next: () => Promise<any>) {

  const {
    clients: { apps },
  } = ctx

  const appSettings: IAppSettings = await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
  )

  console.log(appSettings)

  ctx.body = appSettings
  ctx.set('Content-Type', 'application/json')
  ctx.set('cache-control', 'no-cache')

  await next()
}
