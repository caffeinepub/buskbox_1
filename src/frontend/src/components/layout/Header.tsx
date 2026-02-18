import { Link, useNavigate } from '@tanstack/react-router';
import { Music2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import LoginButton from '../auth/LoginButton';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function Header() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <img src="/assets/generated/buskbox-logo.dim_512x512.png" alt="BuskBox" className="h-8 w-8" />
          <span className="hidden sm:inline">BuskBox</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/category/$category" params={{ category: 'recording' }} className="text-sm font-medium hover:text-primary transition-colors">
            Recordings
          </Link>
          <Link to="/category/$category" params={{ category: 'liveSession' }} className="text-sm font-medium hover:text-primary transition-colors">
            Live Sessions
          </Link>
          <Link to="/category/$category" params={{ category: 'video' }} className="text-sm font-medium hover:text-primary transition-colors">
            Videos
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <LoginButton />

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                  Home
                </Link>
                <Link to="/category/$category" params={{ category: 'recording' }} className="text-sm font-medium hover:text-primary transition-colors">
                  Recordings
                </Link>
                <Link to="/category/$category" params={{ category: 'liveSession' }} className="text-sm font-medium hover:text-primary transition-colors">
                  Live Sessions
                </Link>
                <Link to="/category/$category" params={{ category: 'video' }} className="text-sm font-medium hover:text-primary transition-colors">
                  Videos
                </Link>
                {isAuthenticated && (
                  <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
