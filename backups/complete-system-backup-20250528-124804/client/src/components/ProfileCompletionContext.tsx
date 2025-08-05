import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserCircle, CreditCard, Medal, Briefcase, Clipboard, Calendar, ClipboardCheck, BookOpen, Award } from "lucide-react";

// Definición de los niveles de completitud para cada tipo de perfil
export enum CompletionLevel {
  INCOMPLETE = 'incomplete',
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  COMPLETE = 'complete'
}

// Tipos de campos requeridos por rol
export type FieldRequirement = {
  fieldName: string;
  label: string;
  required: boolean;
  icon: React.ReactNode;
  description: string;
};

// Estado de completitud de un perfil específico
export type ProfileCompletionState = {
  level: CompletionLevel;
  percentage: number;
  missingFields: FieldRequirement[];
  completedFields: FieldRequirement[];
};

// Requerimientos por cada tipo de perfil/rol
const ADMIN_REQUIREMENTS: FieldRequirement[] = [
  { fieldName: 'email', label: 'Correo electrónico', required: true, icon: <UserCircle className="h-4 w-4" />, description: 'Tu correo electrónico principal' },
  { fieldName: 'firstName', label: 'Nombre', required: true, icon: <UserCircle className="h-4 w-4" />, description: 'Tu nombre' },
  { fieldName: 'lastName', label: 'Apellido', required: true, icon: <UserCircle className="h-4 w-4" />, description: 'Tu apellido' },
  { fieldName: 'profileImageUrl', label: 'Foto de perfil', required: false, icon: <UserCircle className="h-4 w-4" />, description: 'Una foto para identificarte' },
  { fieldName: 'phone', label: 'Teléfono', required: false, icon: <CreditCard className="h-4 w-4" />, description: 'Número telefónico para contactarte' },
];

const MANAGER_REQUIREMENTS: FieldRequirement[] = [
  ...ADMIN_REQUIREMENTS,
  { fieldName: 'municipalityId', label: 'Municipio', required: true, icon: <Briefcase className="h-4 w-4" />, description: 'Municipio al que perteneces' },
];

const INSTRUCTOR_REQUIREMENTS: FieldRequirement[] = [
  ...ADMIN_REQUIREMENTS,
  { fieldName: 'bio', label: 'Biografía', required: true, icon: <BookOpen className="h-4 w-4" />, description: 'Resumen de tu experiencia y habilidades' },
  { fieldName: 'specialties', label: 'Especialidades', required: true, icon: <Medal className="h-4 w-4" />, description: 'Tus áreas de especialización' },
  { fieldName: 'experience', label: 'Experiencia', required: true, icon: <Briefcase className="h-4 w-4" />, description: 'Años de experiencia en tu área' },
  { fieldName: 'availableDays', label: 'Días disponibles', required: true, icon: <Calendar className="h-4 w-4" />, description: 'Tu disponibilidad semanal' },
  { fieldName: 'availability', label: 'Horario disponible', required: false, icon: <Calendar className="h-4 w-4" />, description: 'Tus horarios preferidos' },
  { fieldName: 'certifications', label: 'Certificaciones', required: false, icon: <Award className="h-4 w-4" />, description: 'Tus certificaciones profesionales' },
  { fieldName: 'education', label: 'Formación', required: false, icon: <BookOpen className="h-4 w-4" />, description: 'Tu formación académica' },
];

const VOLUNTEER_REQUIREMENTS: FieldRequirement[] = [
  ...ADMIN_REQUIREMENTS,
  { fieldName: 'address', label: 'Dirección', required: true, icon: <CreditCard className="h-4 w-4" />, description: 'Tu domicilio actual' },
  { fieldName: 'legalConsent', label: 'Consentimiento legal', required: true, icon: <ClipboardCheck className="h-4 w-4" />, description: 'Aceptación de términos y condiciones' },
  { fieldName: 'availableDays', label: 'Días disponibles', required: true, icon: <Calendar className="h-4 w-4" />, description: 'Tu disponibilidad semanal' },
  { fieldName: 'availability', label: 'Horario disponible', required: false, icon: <Calendar className="h-4 w-4" />, description: 'Tus horarios preferidos' },
  { fieldName: 'interestAreas', label: 'Áreas de interés', required: true, icon: <Clipboard className="h-4 w-4" />, description: 'Tus áreas de interés para voluntariado' },
  { fieldName: 'previousExperience', label: 'Experiencia previa', required: false, icon: <Briefcase className="h-4 w-4" />, description: 'Tu experiencia previa en voluntariado' },
  { fieldName: 'preferredParkId', label: 'Parque preferido', required: false, icon: <Medal className="h-4 w-4" />, description: 'El parque donde prefieres ser voluntario' },
];

const CITIZEN_REQUIREMENTS: FieldRequirement[] = [
  ...ADMIN_REQUIREMENTS,
  { fieldName: 'address', label: 'Dirección', required: false, icon: <CreditCard className="h-4 w-4" />, description: 'Tu domicilio' },
];

const REQUIREMENTS_BY_ROLE: Record<string, FieldRequirement[]> = {
  admin: ADMIN_REQUIREMENTS,
  director: MANAGER_REQUIREMENTS,
  manager: MANAGER_REQUIREMENTS,
  supervisor: MANAGER_REQUIREMENTS,
  instructor: INSTRUCTOR_REQUIREMENTS,
  voluntario: VOLUNTEER_REQUIREMENTS,
  ciudadano: CITIZEN_REQUIREMENTS,
  guardaparques: MANAGER_REQUIREMENTS,
  guardia: ADMIN_REQUIREMENTS,
  concesionario: MANAGER_REQUIREMENTS,
  user: ADMIN_REQUIREMENTS,
};

// Contexto para gestionar la completitud de perfiles
interface ProfileCompletionContextType {
  getProfileCompletionState: (userData: any, role: string, additionalData?: any) => ProfileCompletionState;
  getRequiredFieldsByRole: (role: string) => FieldRequirement[];
  getLevelColor: (level: CompletionLevel) => string;
  getLevelDescription: (level: CompletionLevel) => string;
  validateField: (fieldName: string, value: any, role: string) => boolean;
}

const ProfileCompletionContext = createContext<ProfileCompletionContextType | undefined>(undefined);

export const useProfileCompletion = () => {
  const context = useContext(ProfileCompletionContext);
  if (!context) {
    throw new Error('useProfileCompletion debe usarse dentro de un ProfileCompletionProvider');
  }
  return context;
};

export const ProfileCompletionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Devuelve los requerimientos de campos según el rol
  const getRequiredFieldsByRole = (role: string): FieldRequirement[] => {
    return REQUIREMENTS_BY_ROLE[role] || ADMIN_REQUIREMENTS;
  };

  // Valida un campo específico según su tipo
  const validateField = (fieldName: string, value: any, role: string): boolean => {
    if (!value) return false;
    
    // Validaciones específicas por tipo de campo
    switch (fieldName) {
      case 'email':
        return /\S+@\S+\.\S+/.test(value);
      case 'fullName':
        return value.trim().length > 5; // Al menos nombre y apellido
      case 'phone':
        return /^\d{10}$/.test(value?.toString().replace(/\D/g, '')); // 10 dígitos
      case 'legalConsent':
        return value === true;
      case 'availableDays':
      case 'interestAreas':
      case 'certifications':
        return Array.isArray(value) && value.length > 0;
      case 'age':
        return typeof value === 'number' && value >= 18;
      case 'bio':
      case 'specialties':
      case 'experience':
      case 'address':
      case 'previousExperience':
        return typeof value === 'string' && value.trim().length >= 3;
      default:
        return !!value; // Si existe el valor, es válido
    }
  };

  // Calcula el estado de completitud del perfil
  const getProfileCompletionState = (userData: any, role: string, additionalData?: any): ProfileCompletionState => {
    const requirements = getRequiredFieldsByRole(role);
    
    // Combinamos los datos del usuario y datos adicionales (por ejemplo, perfil específico)
    const combinedData = { ...userData, ...additionalData };
    
    // Calculamos los campos completados y faltantes
    const completedFields: FieldRequirement[] = [];
    const missingFields: FieldRequirement[] = [];
    
    requirements.forEach(field => {
      const fieldValue = combinedData[field.fieldName];
      const isValid = validateField(field.fieldName, fieldValue, role);
      
      if (isValid) {
        completedFields.push(field);
      } else if (field.required) {
        missingFields.push(field);
      }
    });
    
    // Calculamos el porcentaje de completitud (solo sobre campos requeridos)
    const requiredFields = requirements.filter(f => f.required);
    const completedRequired = completedFields.filter(f => f.required);
    const percentage = requiredFields.length > 0 
      ? Math.floor((completedRequired.length / requiredFields.length) * 100) 
      : 100;
    
    // Determinamos el nivel de completitud
    let level: CompletionLevel;
    if (percentage < 50) {
      level = CompletionLevel.INCOMPLETE;
    } else if (percentage < 80) {
      level = CompletionLevel.BASIC;
    } else if (percentage < 100) {
      level = CompletionLevel.INTERMEDIATE;
    } else {
      level = CompletionLevel.COMPLETE;
    }
    
    return {
      level,
      percentage,
      missingFields,
      completedFields
    };
  };

  // Devuelve un color según el nivel de completitud
  const getLevelColor = (level: CompletionLevel): string => {
    switch (level) {
      case CompletionLevel.INCOMPLETE:
        return 'text-red-500';
      case CompletionLevel.BASIC:
        return 'text-yellow-500';
      case CompletionLevel.INTERMEDIATE:
        return 'text-blue-500';
      case CompletionLevel.COMPLETE:
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  // Devuelve una descripción según el nivel de completitud
  const getLevelDescription = (level: CompletionLevel): string => {
    switch (level) {
      case CompletionLevel.INCOMPLETE:
        return 'Perfil incompleto. Por favor, completa la información requerida.';
      case CompletionLevel.BASIC:
        return 'Perfil básico. Completa más información para mejorar tu perfil.';
      case CompletionLevel.INTERMEDIATE:
        return 'Perfil intermedio. ¡Ya casi está completo!';
      case CompletionLevel.COMPLETE:
        return '¡Perfil completo! Toda la información necesaria ha sido proporcionada.';
      default:
        return 'Estado del perfil desconocido.';
    }
  };

  // Valor del contexto
  const value = {
    getProfileCompletionState,
    getRequiredFieldsByRole,
    getLevelColor,
    getLevelDescription,
    validateField
  };

  return (
    <ProfileCompletionContext.Provider value={value}>
      {children}
    </ProfileCompletionContext.Provider>
  );
};