import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface EventType {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  status: string;
  image?: string;
  price?: string;
  tags?: string[];
  user_id?: string;
  created_at?: string;
}

interface ProfileDropdownProps {
  userEvents: EventType[];
  savedEvents: EventType[];
  profileMenuOpen: boolean;
  setProfileMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
  formatDate: (date: string) => string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  userEvents,
  savedEvents,
  profileMenuOpen,
  handleLogout,
  formatDate,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={dropdownRef} className="relative" style={{ display: 'inline-block' }}>
      {profileMenuOpen && (
        <div
          className="absolute right-0 top-full mt-5 w-80 bg-retro-navy shadow-lg rounded-lg border-2 border-retro-warm-yellow p-4 z-[9999] max-h-96 overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            {/* Events Section */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-retro-cream">Your Events</h3>
              {userEvents && userEvents.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {userEvents.map((event: EventType) => (
                    <li key={event.id} className="border-b border-retro-cool-teal pb-2">
                      <p className="font-medium text-retro-warm-yellow">{event.title}</p>
                      <p className="text-xs text-retro-cream">Status: {event.status}</p>
                      <p className="text-xs text-retro-cream">Date: {formatDate(event.date)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-retro-cream">
                  You haven't posted any events yet.
                </p>
              )}
            </div>

            {/* Saved Events Section */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-retro-cream flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                Saved Events ({savedEvents.length})
              </h3>
              {savedEvents.length > 0 ? (
                <ul className="space-y-2 text-sm max-h-32 overflow-y-auto">
                  {savedEvents.map((event: EventType) => (
                    <li key={event.id} className="border-b border-retro-cool-teal pb-2">
                      <p className="font-medium text-retro-warm-yellow">{event.title}</p>
                      <p className="text-xs text-retro-cream">Date: {formatDate(event.date)}</p>
                      <p className="text-xs text-retro-cream">Location: {event.location}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-retro-cream">
                  No saved events yet. Click the heart icon on events to save them!
                </p>
              )}
            </div>
          </div>

          <hr className="my-3 border-retro-cool-teal" />
          <Button
            variant="outline"
            className="w-full text-sm border-2 border-retro-warm-yellow text-retro-warm-yellow hover:bg-retro-warm-yellow hover:text-retro-navy transition-colors"
            onClick={e => {
              e.stopPropagation();
              handleLogout();
            }}
          >
            Logout
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown; 