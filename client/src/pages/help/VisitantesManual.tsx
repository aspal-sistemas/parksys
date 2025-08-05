import React from 'react';
import { DocumentationViewer } from '@/components/DocumentationViewer';
import { useLocation } from 'wouter';

export default function VisitantesManual() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <DocumentationViewer 
        documentId="visitantes-manual"
        onBack={() => setLocation('/admin')}
      />
    </div>
  );
}