import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  showAll?: boolean;
  showAllLink?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  showAll = false,
  showAllLink = '#',
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      {showAll && (
        <Link
          to={showAllLink}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          Ver tudo
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
};
