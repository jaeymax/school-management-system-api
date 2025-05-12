export interface IClass {
  class_id: number;
  name: string;
  description?: string;
  academic_term_id?: number;
  teacher_id?: number;
}

export interface ICreateClass {
  name: string;
  description?: string;
  academic_term_id?: number;
  teacher_id?: number;
}
