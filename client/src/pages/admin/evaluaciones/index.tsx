// Redirigir al dashboard de evaluaciones
import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function EvaluacionesPage() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirigir al dashboard principal de evaluaciones
    setLocation('/admin/evaluaciones/dashboard');
  }, [setLocation]);

  return null; // La redirección se maneja en useEffect
}