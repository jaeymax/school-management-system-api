export interface IFee {
  fee_id: number;
  student_id: number;
  fee_type_id: number;
  fee_class_pricing_id: number;
  academic_term_id?: number;
  due_date: Date;
  status: "pending" | "paid" | "overdue" | "cancelled";
  created_at: Date;
}

export interface ICreateFee {
  student_id: number;
  fee_type_id: number;
  fee_class_pricing_id: number;
  academic_term_id?: number;
  due_date: Date;
  status?: "pending" | "paid" | "overdue" | "cancelled";
  amount:number;
  is_tuition?: boolean;
}

export interface IFeePayment {
  payment_id: number;
  fee_id: number;
  amount_paid: number;
  payment_date: Date;
  payment_method: "cash" | "bank_transfer" | "mobile_money" | "check";
  status: "completed" | "pending" | "failed";
  transaction_reference?: string;
  received_by?: number;
  notes?: string;
}

export interface ICreateFeePayment {
  fee_id: number;
  amount_paid: number;
  payment_method: "cash" | "bank_transfer" | "mobile_money" | "check";
  status?: "completed" | "pending" | "failed";
  transaction_reference?: string;
  received_by?: number;
  notes?: string;
}
