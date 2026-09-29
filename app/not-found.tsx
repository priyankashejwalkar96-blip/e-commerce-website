import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h1 className="font-serif text-6xl font-bold text-primary-text">404</h1>
      <h2 className="font-serif text-2xl font-bold text-primary-text">Page Not Found</h2>
      <p className="text-xs text-secondary-text max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  );
}
