export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  municipalityId: number | null;
  profileImageUrl?: string;
  phone?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  bio?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Volunteer {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  age?: number;
  previous_experience?: string;
  status: string;
  profile_image_url?: string;
  preferred_park_id?: number;
  legal_consent?: boolean;
  created_at?: string;
  gender?: string;
  interest_areas?: string[];
  available_days?: string[];
  available_hours?: string;
  totalHours?: number;
  recognitions?: any[];
  // Campos adicionales para la integración de usuarios
  source?: 'module' | 'user';
  user_id?: number;
}

export interface UserFormData extends User {
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  bio?: string;
  experience?: string;
  specialties?: string[];
  curriculumFile?: File | null;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredParkId?: number | null;
  legalConsent?: boolean;
  profileImageFile?: File | null;
}