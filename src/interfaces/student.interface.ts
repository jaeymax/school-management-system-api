export interface IStudent {
  student_id: number;
  user_id: number;
  class_id: number;
  user?: {
    username: string;
    email?: string;
    phone?: string;
    gender: string;
    profile_image?: string;
  };
  class?: {
    name: string;
    description?: string;
  };
}
