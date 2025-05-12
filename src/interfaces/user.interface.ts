export interface IUser {
  user_id: number;
  username: string;
  email?: string;
  role: "admin" | "teacher" | "student";
  phone?: string;
  address?: string;
  date_of_birth?: Date;
  gender: "male" | "female";
  profile_image?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IUserCreate {
  username: string;
  password?: string;
  email?: string;
  role: "admin" | "teacher" | "student";
  phone?: string;
  address?: string;
  date_of_birth?: Date;
  gender: "male" | "female";
  profile_image?: string;
  class_id?: number; // Required for student registration
}
