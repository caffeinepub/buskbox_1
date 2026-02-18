import { ReactNode } from 'react';

interface MediaGridProps {
  children: ReactNode;
}

export default function MediaGrid({ children }: MediaGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children}
    </div>
  );
}
