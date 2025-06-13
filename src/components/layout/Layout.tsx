import { ReactNode } from 'react';
import { cn } from '@/utils';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Layout({ children, className, maxWidth = 'lg' }: LayoutProps) {
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-none',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className={cn(
        'container mx-auto px-4 py-8',
        maxWidths[maxWidth],
        className
      )}>
        {children}
      </main>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn('text-center mb-8', className)}>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-600 mb-4">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}