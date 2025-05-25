import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 mb-6 space-y-3 md:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2 self-start">{actions}</div>}
    </div>
  );
};

export default PageHeader;