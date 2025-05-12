export interface IDailyFeeding {
  feeding_id: number;
  fee_class_pricing_id: number;
  academic_term_id: number;
  student_id: number;
  date: Date;
  status: "unpaid" | "paid" | "excused";
  created_at: Date;
  notes?: string;
}

export interface ICreateDailyFeeding {
  fee_class_pricing_id: number;
  academic_term_id: number;
  student_id: number;
  date: Date;
  status?: "unpaid" | "paid" | "excused";
  notes?: string;
}

export interface IBulkDailyFeeding {
  fee_class_pricing_id: number;
  academic_term_id: number;
  class_id?: number;
  student_ids?: number[];
  date: Date;
  status?: "unpaid" | "paid" | "excused";
  notes?: string;
}

export interface ICreateDailyFeedingPayment {
  amount_paid: number;
  payment_method: "cash" | "bank_transfer" | "mobile_money" | "check";
  transaction_reference?: string;
  received_by?: number;
  notes?: string;
}
