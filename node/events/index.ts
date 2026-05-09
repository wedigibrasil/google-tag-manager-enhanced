import { setupAppConfiguration } from "./onSettingsChanged";
import { onPaymentApproved } from "./onPaymentApproved";
import { onInvoiced } from "./onInvoiced";

export const events = {
  onSettingsChanged: [setupAppConfiguration],
  onPaymentApproved: [onPaymentApproved],
  onInvoiced: [onInvoiced]
}
