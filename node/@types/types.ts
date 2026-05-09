import { AdditionalInfo, OrderDetailResponse, OrderItemDetailResponse } from "@vtex/clients"

export interface IAppSettings {
  gtmId: string,
  allowCustomHtmlTags: boolean,
  sendGA4Events: boolean,
  transportUrl: string,
  ga4PropertyId: string,
  ga4MeasurementProtocolAPI: string,
  sendOrderPlacedOnServerSide: boolean,
  apiKey: string,
  apiUrl: string
}

export interface EnhancedOrderDetailItemCategory {
  id: number
  name: string
}

export interface EnhancedAdditionalInfo extends AdditionalInfo {
  categories: EnhancedOrderDetailItemCategory[]
}

export interface EnhancedOrderItemDetailResponse extends OrderItemDetailResponse {
  additionalInfo: EnhancedAdditionalInfo
}

export interface EnchancedOrderDetailResponse extends OrderDetailResponse {
  items: EnhancedOrderItemDetailResponse[]
}
