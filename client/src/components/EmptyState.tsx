import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actions
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-muted/20 rounded-lg border border-dashed">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h3 className="mt-6 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {description}
      </p>
      {actions && (
        <div className="mt-6">
          {actions}
        </div>
      )}
    </div>
  );
};

export default EmptyState;