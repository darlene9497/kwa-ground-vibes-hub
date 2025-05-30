import React from 'react';
import logo from '../../assets/kwa-ground-logo.png'
import { Search, User, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
  };
  profile?: {
    name?: string;
    full_name?: string;
  };
}

interface HeaderProps {
  user: User | null;
  displayName: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setSearchPerformed: (v: boolean) => void;
  profileMenuOpen: boolean;
  setProfileMenuOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  user,
  displayName,
  searchQuery,
  setSearchQuery,
  setSearchPerformed,
  profileMenuOpen,
  setProfileMenuOpen,
  children
}) => (
  <header className="bg-retro-cream border-b-4 border-black px-2 sm:px-4 py-2">
    <div className="max-w-7xl mx-auto w-full">
      {/* Mobile layout */}
      <div className="flex flex-col sm:hidden w-full">
        <div className="flex items-center justify-between w-full mb-2">
          <img
            src={logo}
            alt="KwaGround Logo"
            className="h-24 w-auto"
            draggable={false}
          />
          <div className="flex items-center">
            {user ? (
              <div className="relative flex items-center gap-2">
                <span className="text-sm text-retro-cream hidden sm:inline">
                  {displayName}
                </span>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="p-2 rounded-full bg-retro-navy hover:bg-retro-navy/20 transition-colors"
                  aria-label="Profile menu"
                >
                  {profileMenuOpen ? <X className="w-6 h-6 text-retro-warm-yellow" /> : <User className="w-6 h-6 text-retro-warm-yellow" />}
                </button>
                {children}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="default"
                  className="text-xs bg-retro-burnt-orange hover:bg-retro-deep-red text-retro-cream border-2 border-retro-warm-yellow"
                  onClick={() => (window.location.href = "/auth")}
                >
                  Login
                </Button>
                <p className="text-xs text-retro-navy italic">Login to share an event</p>
              </div>
            )}
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="w-full">
            <form
              onSubmit={e => {
                e.preventDefault();
                setSearchPerformed(true);
                setSearchQuery(searchQuery.trim());
              }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-retro-deep-teal w-5 h-5" />
              <Input
                placeholder="Search events, locations, or vibes..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setSearchPerformed(false);
                }}
                className="pl-10 bg-retro-cream border-2 border-black  focus:bg-white transition-colors rounded-lg text-retro-navy text-base"
              />
            </form>
          </div>
        </div>
      </div>
      {/* Desktop layout */}
      <div className="hidden sm:flex items-center justify-between h-24 w-full relative">
        <div className="flex-shrink-0">
          <img
            src={logo}
            alt="KwaGround Logo"
            className="h-24 w-auto"
            draggable={false}
          />
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
          <div className="relative">
            <form
              onSubmit={e => {
                e.preventDefault();
                setSearchPerformed(true);
                setSearchQuery(searchQuery.trim());
              }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-retro-deep-teal w-5 h-5" />
              <Input
                placeholder="Search events, locations, or vibes..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setSearchPerformed(false);
                }}
                className="pl-10 bg-retro-cream border-2 border-black focus:border-black focus:bg-white transition-colors rounded-lg text-black text-base"
              />
            </form>
          </div>
        </div>
        <div className="flex-shrink-0 ml-auto flex items-center">
          {user ? (
            <div className="relative flex items-center gap-2">
              <span className="text-sm text-retro-navy hidden sm:inline">
                {displayName}
              </span>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="p-2 rounded-full bg-retro-navy hover:bg-retro-navy/20 transition-colors"
                aria-label="Profile menu"
              >
                {profileMenuOpen ? <X className="w-6 h-6 text-retro-warm-yellow" /> : <User className="w-6 h-6 text-retro-warm-yellow" />}
              </button>
              {children}
            </div>
          ) : (
            <Button
              variant="default"
              className="text-xs bg-retro-red-orange hover:bg-retro-deep-red text-retro-cream border-2 border-retro-warm-yellow"
              onClick={() => (window.location.href = "/auth")}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  </header>
);

export default Header; 