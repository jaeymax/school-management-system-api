export interface IFeeType {
  fee_type_id: number;
  name: string;
  description?: string;
  is_recurring: boolean;
}

export interface ICreateFeeType {
  name: string;
  description?: string;
  is_recurring?: boolean;
}
