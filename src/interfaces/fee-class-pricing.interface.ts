export interface IFeeClassPricing {
  pricing_id: number;
  fee_type_id: number;
  class_id: number;
  amount: number;
}

export interface ICreateFeeClassPricing {
  fee_type_id: number;
  class_id: number;
  amount: number;
}
