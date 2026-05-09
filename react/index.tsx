import { canUseDOM } from 'vtex.render-runtime'

import { sendEnhancedEcommerceEvents } from './modules/enhancedEcommerceEvents'
import { sendExtraEvents } from './modules/extraEvents'
import { sendLegacyEvents } from './modules/legacyEvents'
import { PixelMessage } from './typings/events'

// no-op for extension point
export default function() {
  return null
}

export function handleEvents(e: PixelMessage) {
  if (!e || !e.data || typeof e.data.eventName !== 'string') {
    return
  }

  sendEnhancedEcommerceEvents(e)
  sendExtraEvents(e)
  sendLegacyEvents(e)
}

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
