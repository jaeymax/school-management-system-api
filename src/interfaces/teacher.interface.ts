export interface ITeacher {
  teacher_id: number;
  user_id: number;
  user?: {
    username: string;
    email?: string;
    phone?: string;
    gender: string;
    profile_image?: string;
  };
}

export interface ITeacherClass {
  class_id: number;
  name: string;
  description?: string;
  academic_term_id?: number;
}
