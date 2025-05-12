export interface IAcademicTerm {
  term_id: number;
  name: string;
  start_date: Date;
  end_date: Date;
  is_current: boolean;
}

export interface ICreateAcademicTerm {
  name: string;
  start_date: Date;
  end_date: Date;
  is_current?: boolean;
}
