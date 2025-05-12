export interface ISubject {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  description?: string;
  is_core: boolean;
}

export interface ICreateSubject {
  subject_name: string;
  subject_code: string;
  description?: string;
  is_core?: boolean;
}

export interface IClassSubject {
  class_subject_id: number;
  class_id: number;
  subject_id: number;
}
