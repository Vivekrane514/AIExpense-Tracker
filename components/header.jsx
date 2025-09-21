"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { LayoutDashboard, PenBox, Loader2, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingTransaction, setLoadingTransaction] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  useEffect(() => {
    // When route changes to /dashboard, stop loading
    if (pathname === '/dashboard') {
      setLoadingDashboard(false);
    }
    // When route changes to /transaction/create, stop loading
    if (pathname === '/transaction/create') {
      setLoadingTransaction(false);
    }
    // Reset login loading on any route change
    setLoadingLogin(false);
  }, [pathname]);

  const handleDashboardClick = (e) => {
    e.preventDefault();
    setLoadingDashboard(true);
    router.push('/dashboard');
  };

  const handleTransactionClick = (e) => {
    e.preventDefault();
    setLoadingTransaction(true);
    router.push('/transaction/create');
  };

  const handleLoginClick = (e) => {
    setLoadingLogin(true);
  };

  return (
    <div className='fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b'>
      <nav className='container mx-auto px-4 py-4 flex items-center justify-between'>
        <a href="/">
          <Image
            src={"/logo.png"} alt='wealth logo' height={60} width={200}
            className='h-12 w-auto object-contain'
          />
        </a>

      <div className='flex items-center space-x-4'>
        <SignedIn>
          <Button
            variant="outline"
            className='text-gray-600 hover:text-blue-600 flex items-center gap-2 cursor-pointer'
            onClick={handleDashboardClick}
            disabled={loadingDashboard} 
          >
            {loadingDashboard ? <Loader2 className="animate-spin h-5 w-5" /> : <LayoutDashboard size={18} />}
            <span className='hidden md:inline'>Dashboard</span>
          </Button>

          <Button
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleTransactionClick}
            disabled={loadingTransaction}
          >
            {loadingTransaction ? (
              <div className="w-12 h-1 bg-gray-200 rounded overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-6 bg-red-500 rounded animate-slide" />
                <style jsx>{`
                  @keyframes slide {
                    0% {
                      left: -25%;
                    }
                    100% {
                      left: 100%;
                    }
                  }
                  .animate-slide {
                    animation: slide 1s linear infinite;
                  }
                `}</style>
              </div>
            ) : (
              <PenBox size={18} />
            )}
            <span className='hidden md:inline'>Add Transaction</span>
          </Button>
        </SignedIn>

      <SignedOut>
          <SignInButton forceRedirectUrl='/dashboard'>
            <Button
              variant="outline"
              className="cursor-pointer flex items-center justify-center gap-2"
              onClick={handleLoginClick}
              disabled={loadingLogin}
            >
              {loadingLogin ? <Loader2 className="animate-spin h-5 w-5" /> : 'Login'}
            </Button>
          </SignInButton>
      </SignedOut>

      {/* Theme Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="w-10 h-10"
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </Button>

      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10",
            },
          }}
        />
      </SignedIn>
      </div>
      </nav>
    </div>
  );
};

export default Header;
