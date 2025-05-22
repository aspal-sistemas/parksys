export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  municipalityId: number | null;
  profileImageUrl?: string;
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