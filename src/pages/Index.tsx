import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sparkles, User, Calendar, Clock, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FilterBar from '@/components/FilterBar';
import EventSubmissionModal from '@/components/EventSubmissionModal';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>(['All Events']);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userEvents, setUserEvents] = useState([]);

  interface Event {
    id: number;
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
  }

  const [events, setEvents] = useState<Event[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName =
    user?.profile?.name ||
    user?.profile?.full_name ||
    user?.user_metadata?.name ||
    user?.email;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          setUser((prevUser: any) => ({
            ...prevUser,
            profile: profileData,
          }));
        }

        const { data: myEvents } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id);
        setUserEvents(myEvents || []);
      }
    };

    const fetchApprovedEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching events:', error);
      } else {
        const validatedEvents = data.map(event => ({
          ...event,
          title: event.title || '',
          description: event.description || '',
          date: event.date || '',
          time: event.time || '',
          location: event.location || '',
          category: event.category || '',
          tags: event.tags || []
        }));
        setEvents(validatedEvents);
      }
    };

    fetchUserProfile();
    fetchApprovedEvents();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    } else {
      setUser(null);
      window.location.href = '/auth';
    }
  };

  const handleFilterToggle = (filter: string) => {
    if (filter === 'All Events') {
      setActiveFilters(['All Events']);
    } else {
      const newFilters = activeFilters.includes(filter)
        ? activeFilters.filter((f) => f !== filter)
        : [...activeFilters.filter((f) => f !== 'All Events'), filter];

      setActiveFilters(newFilters.length === 0 ? ['All Events'] : newFilters);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesFilter =
      activeFilters.includes('All Events') || activeFilters.includes(event.category);
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-retro-cream via-retro-warm-yellow/20 to-retro-deep-teal/10">
      {/* Header */}
      <header className="bg-retro-warm-yellow border-b-4 border-retro-burnt-orange px-2 sm:px-4 py-2">
        <div className="max-w-7xl mx-auto w-full">
          {/* Mobile layout */}
          <div className="flex flex-col sm:hidden w-full">
            <div className="flex items-center justify-between w-full mb-2">
              <img
                src="/assets/kwa-ground-logo.png"
                alt="KwaGround Logo"
                className="h-24 w-auto"
                draggable={false}
              />
              <div className="flex items-center">
                {user ? (
                  <div
                    ref={dropdownRef}
                    className="relative flex items-center gap-2"
                  >
                    <span className="text-sm text-retro-cream hidden sm:inline">
                      {displayName}
                    </span>
                    <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="p-2 rounded-full bg-retro-navy hover:bg-retro-navy/20 transition-colors"
                        aria-label="Profile menu"
                      >
                        <User className="w-6 h-6 text-retro-warm-yellow sm:text-retro-warm-yellow text-retro-navy" />
                      </button>

                    {profileMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-retro-navy shadow-lg rounded-lg border-2 border-retro-warm-yellow p-4 z-50 max-h-96 overflow-auto">
                        <h3 className="text-sm font-semibold mb-2 text-retro-cream">Your Events</h3>
                        {userEvents.length > 0 ? (
                          <ul className="space-y-2 text-sm">
                            {userEvents.map((event: Event) => (
                              <li key={event.id} className="border-b border-retro-cool-teal pb-2">
                                <p className="font-medium text-retro-warm-yellow">{event.title}</p>
                                <p className="text-xs text-retro-cream">Status: {event.status}</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-retro-cream">
                            You haven't posted any events yet.
                          </p>
                        )}

                        <hr className="my-3 border-retro-cool-teal" />
                        <Button
                          variant="outline"
                          className="w-full text-sm border-2 border-retro-warm-yellow text-retro-warm-yellow hover:bg-retro-warm-yellow hover:text-retro-navy transition-colors"
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="default"
                    className="text-xs bg-retro-burnt-orange hover:bg-retro-deep-red text-retro-cream border-2 border-retro-warm-yellow"
                    onClick={() => (window.location.href = "/auth")}
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
            <div className="w-full flex justify-center">
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-retro-deep-teal w-5 h-5" />
                  <Input
                    placeholder="Search events, locations, or vibes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-retro-cream border-2 border-retro-mustard focus:border-retro-burnt-orange focus:bg-white transition-colors rounded-lg text-retro-navy text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-between h-24 w-full relative">
            
            <div className="flex-shrink-0">
              <img
                src="/assets/kwa-ground-logo.png"
                alt="KwaGround Logo"
                className="h-24 w-auto"
                draggable={false}
              />
            </div>
            
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-retro-deep-teal w-5 h-5" />
                <Input
                  placeholder="Search events, locations, or vibes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-retro-cream border-2 border-retro-burnt-orange focus:border-retro-bright-blue focus:bg-white transition-colors rounded-lg text-retro-navy text-base"
                />
              </div>
            </div>

            <div className="flex-shrink-0 ml-auto flex items-center">
              {user ? (
                <div
                  ref={dropdownRef}
                  className="relative flex items-center gap-2"
                >
                  <span className="text-sm text-retro-navy hidden sm:inline">
                    {displayName}
                  </span>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="p-2 rounded-full bg-retro-navy hover:bg-retro-navy/20 transition-colors"
                    aria-label="Profile menu"
                  >
                    <User className="w-6 h-6 text-retro-warm-yellow" />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-retro-navy shadow-lg rounded-lg border-2 border-retro-warm-yellow p-4 z-50 max-h-96 overflow-auto">
                      <h3 className="text-sm font-semibold mb-2 text-retro-cream">Your Events</h3>
                      {userEvents.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                          {userEvents.map((event: Event) => (
                            <li key={event.id} className="border-b border-retro-cool-teal pb-2">
                              <p className="font-medium text-retro-warm-yellow">{event.title}</p>
                              <p className="text-xs text-retro-cream">Status: {event.status}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-retro-cream">
                          You haven't posted any events yet.
                        </p>
                      )}

                      <hr className="my-3 border-retro-cool-teal" />
                      <Button
                        variant="outline"
                        className="w-full text-sm border-2 border-retro-warm-yellow text-retro-warm-yellow hover:bg-retro-warm-yellow hover:text-retro-navy transition-colors"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                  )}
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

      {/* Filter Bar */}
      <FilterBar activeFilters={activeFilters} onFilterToggle={handleFilterToggle} />

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-retro-navy">
              {activeFilters.includes('All Events') ? 'All Events' : activeFilters.join(', ')}
            </h2>
            <span className="text-sm text-retro-deep-teal">{filteredEvents.length} events</span>
          </div>

          {filteredEvents.length === 0 ? (
            <Card className="text-center py-8 bg-retro-cream border-2 border-retro-mustard">
              <CardContent>
                <div className="text-retro-deep-teal">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-retro-bright-blue" />
                  <h3 className="font-medium mb-2 text-retro-navy">No events found</h3>
                  <p className="text-retro-cool-teal">Try adjusting your filters or search terms</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 justify-center">
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="
                    relative bg-retro-cream border-2 border-black
                    p-0 overflow-visible transition-all duration-200 ease-in-out
                    hover:-translate-y-2 rounded-none
                    max-w-sm w-full
                    before:content-[''] before:absolute before:top-2 before:left-2 before:-right-2 before:-bottom-2
                    before:bg-retro-mustard/60 before:z-[-1] before:border before:border-black/60 before:rounded-none
                    after:content-[''] after:absolute after:top-4 after:left-4 after:-right-4 after:-bottom-4
                    after:bg-retro-deep-red/60 after:z-[-2] after:border after:border-black/60 after:rounded-none
                  "
                >
                  {/* Card Image or Logo */}
                  <div className="relative h-60 overflow-hidden bg-retro-mustard flex items-center justify-center rounded-none">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="object-cover w-full h-full" />
                    ) : (
                      <img
                        src="/assets/kwa-ground-logo.png"
                        alt="KwaGround Logo"
                        className="opacity-30 w-40 h-40"
                        style={{ filter: 'grayscale(1)' }}
                      />
                    )}
                    {/* Category Badge */}
                    <Badge className="
                      absolute top-2 left-2
                      bg-retro-red-orange text-retro-cream
                      font-retro text-xs px-2 py-0.5
                      border-2 border-black
                      -rotate-2
                      pointer-events-none
                    ">
                      {event.category}
                    </Badge>
                    {/* Price Badge */}
                    {event.price && (
                      <Badge className="
                        absolute top-2 right-2
                        bg-retro-mustard text-retro-navy
                        font-bold text-xs px-2 py-0.5
                        border-2 border-black
                        rotate-2
                        pointer-events-none
                      ">
                        {event.price.trim().toLowerCase() === 'free' ? 'FREE' : event.price}
                      </Badge>
                    )}
                  </div>

                  {/* Card Content */}
                  <CardContent className="
                    bg-retro-cream border-t-2 border-black
                    p-6 space-y-4 rounded-none
                  ">
                    {/* Title */}
                    <h3 className="
                      font-retro text-lg text-retro-navy
                      font-bold uppercase tracking-wider
                    ">
                      {event.title}
                    </h3>
                    {/* Description */}
                    <p className="text-retro-deep-teal text-xs font-retro">
                      {event.description.length > 100 ? event.description.slice(0, 100) + '...' : event.description}
                    </p>
                    {/* Info Rows */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1 text-retro-cool-teal text-xs">
                          <Calendar className="w-3 h-3 text-retro-bright-blue" />
                          <span className="font-semibold">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-retro-cool-teal text-xs">
                          <Clock className="w-3 h-3 text-retro-deep-teal" />
                          <span className="font-semibold">{event.time}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1 text-retro-cool-teal text-xs">
                          <MapPin className="w-3 h-3 text-retro-red-orange" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-retro-cool-teal text-xs">
                          <DollarSign className="w-3 h-3 text-retro-mustard" />
                          <span>
                            {event.price?.trim().toLowerCase() === 'free'
                              ? 'Free Entry'
                              : event.price?.toLowerCase().includes('ksh')
                                ? event.price
                                : `KSh ${event.price}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {event.tags?.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="
                            text-xs border-retro-mustard text-retro-deep-teal
                            bg-retro-cream font-retro px-2 py-0.5 rounded-none
                            pointer-events-none
                          "
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="h-20"></div>
      </main>

      {/* Show only if logged in */}
      {user && <EventSubmissionModal />}
    </div>
  );
};

export default Index;
