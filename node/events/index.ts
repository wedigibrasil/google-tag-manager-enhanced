import { setupAppConfiguration } from "./onSettingsChanged";
import { onPaymentApproved } from "./onPaymentApproved";

export const events = {
  onSettingsChanged: [setupAppConfiguration],
  onPaymentApproved: [onPaymentApproved]
}
