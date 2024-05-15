export async function status(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { apps },
  } = ctx
  const appSettings = await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
  )

  console.log(appSettings)
  ctx.body = appSettings
  ctx.set('cache-control', 'no-cache')

  await next()
}
