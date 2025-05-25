import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-40">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-t-4 border-b-4 border-primary rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;