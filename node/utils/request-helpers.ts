import { IOContext, RequestTracingConfig } from '@vtex/api'

import { createTracing } from './tracing-helper'

export const getRequestConfig = (
  context: IOContext,
  metric: string,
  tracingConfig?: RequestTracingConfig
  // eslint-disable-next-line max-params
) => {
  const token = context.authToken
  const headers: Headers = token
    ? {
        VtexIdclientAutCookie: token,
      }
    : {}

  return {
    headers,
    metric,
    tracing: createTracing(metric, tracingConfig),
  }
}

export interface Headers {
  [key: string]: string
}
