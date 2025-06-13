import { cn } from '@/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex justify-center', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
        sizes[size]
      )} />
    </div>
  );
}

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ message = 'Cargando...' }: LoadingPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}