import { useState, useEffect, useRef } from 'react';
import logo from '../../assets/kwa-ground-logo.png';
import { Search, MapPin, Sparkles, User, Calendar, Clock, DollarSign, Heart, Share2  } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FilterBar from '@/components/FilterBar';
import EventSubmissionModal from '@/components/EventSubmissionModal';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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

interface Event {
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

const Index = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>(['All Events']);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([]);
  const [savedEvents, setSavedEvents] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const { toast } = useToast();

  const displayName =
    user?.profile?.name ||
    user?.profile?.full_name ||
    user?.user_metadata?.name ||
    user?.email;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.id) {
          setUser(user);

          // Fetch profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('❌ Error fetching profile:', profileError);
          } else if (profileData) {
            setUser((prevUser: User | null) => ({
              ...prevUser!,
              profile: profileData,
            }));
          }

          // Fetch user events
          const { data: myEvents, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .eq('user_id', user.id);

          if (eventsError) {
            console.error('❌ Error fetching user events:', eventsError);
          } else {
            const validatedEvents = (myEvents || []).map(event => ({
              ...event,
              id: event.id,
              title: event.title || '',
              description: event.description || '',
              date: event.date || '',
              time: event.time || '',
              location: event.location || '',
              category: event.category || '',
              status: event.status || '',
              tags: event.tags || [],
              user_id: event.user_id || '',
              created_at: event.created_at || ''
            })) as unknown as Event[];
            setUserEvents(validatedEvents);
          }

          // Fetch user's favorite events
          const { data: favorites, error: favError } = await supabase
            .from('user_favorites')
            .select('event_id')
            .eq('user_id', user.id);

          if (favError) {
            console.error('Error details:', {
              message: favError.message,
              details: favError.details,
              hint: favError.hint,
              code: favError.code
            });
          } else {
            console.log('✅ Favorites fetched successfully:', favorites);
            const favoriteIds = favorites?.map(fav => fav.event_id).filter((id): id is string => !!id) || [];
            console.log('📝 Final favorite IDs:', favoriteIds);
            setFavoriteEvents(favoriteIds);
          }
        } else {
          console.log('👤 No user authenticated');
        }
      } catch (error) {
        console.error('❌ Error in fetchUserProfile:', error);
      }
    };

    const fetchApprovedEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'approved');

        if (error) {
          console.error('❌ Error fetching events:', error);
        } else {
          const validatedEvents = data.map(event => ({
            ...event,
            id: event.id,
            title: event.title || '',
            description: event.description || '',
            date: event.date || '',
            time: event.time || '',
            location: event.location || '',
            category: event.category || '',
            tags: event.tags || []
          })) as Event[];
          console.log('📅 Events loaded:', validatedEvents.length);
          setEvents(validatedEvents);
        }
      } catch (error) {
        console.error('❌ Error in fetchApprovedEvents:', error);
      }
    };

    fetchUserProfile();
    fetchApprovedEvents();
  }, []);

  // Fetch saved events when favorites change
  useEffect(() => {    
    if (favoriteEvents.length > 0 && events.length > 0) {
      const saved = events.filter(event => favoriteEvents.includes(event.id));
      setSavedEvents(saved);
    } else {
      setSavedEvents([]);
    }
  }, [favoriteEvents, events]);

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
      setFavoriteEvents([]);
      setSavedEvents([]);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  useEffect(() => {
    if (searchPerformed && filteredEvents.length > 0) {
      setSearchQuery('');
      setSearchPerformed(false);
    }
  }, [filteredEvents, searchPerformed]);

  const handleFavoriteToggle = async (eventId: string) => {
    if (!user?.id) {
      window.location.href = '/auth';
      return;
    }

    setIsLoadingFavorites(true);

    const isFavorited = favoriteEvents.includes(eventId);
    
    try {
      if (isFavorited) { 
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .match({ 
            user_id: user.id, 
            event_id: eventId 
          });

        if (error) {
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
        } else {
          setFavoriteEvents(prev => {
            const newFavorites = prev.filter(id => id !== eventId);
            return newFavorites;
          });
        }
      } else {        
        const { data, error } = await supabase
          .from('user_favorites')
          .insert({ 
            user_id: user.id, 
            event_id: eventId 
          })
          .select();

        if (error) {
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
        } else {
          setFavoriteEvents(prev => {
            // Only add if not already in favorites
            if (!prev.includes(eventId)) {
              const newFavorites = [...prev, eventId];
              return newFavorites;
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error('❌ Unexpected error in handleFavoriteToggle:', error);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const handleShareEvent = async (event) => {
    const shareData = {
      title: event.title,
      text: `Check out this event: ${event.title}\n\n${event.description}\n\nDate: ${formatDate(event.date)}\nTime: ${formatTime(event.time)}\nLocation: ${event.location}\nPrice: ${event.price?.trim().toLowerCase() === 'free' ? 'Free' : event.price?.toLowerCase().includes('ksh') ? event.price : `KSh ${event.price}`}`,
      url: window.location.href
    };
  
    try {
      // Check if the Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Event Shared 🚀",
          description: "Event details have been shared successfully!",
        });
      } else {
        // Fallback: Copy to clipboard
        const shareText = `${shareData.title}\n\n${shareData.text}\n\nView more at: ${shareData.url}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Copied to Clipboard 📋",
            description: "Event details have been copied to your clipboard and are ready to share!",
          });
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            document.execCommand('copy');
            toast({
              title: "Copied to Clipboard 📋",
              description: "Event details have been copied to your clipboard and are ready to share!",
            });
          } catch (err) {
            console.error('Failed to copy text: ', err);
            toast({
              title: "Share Failed ❌",
              description: "Unable to share or copy event details. Please try again.",
              variant: "destructive",
            });
          } finally {
            document.body.removeChild(textArea);
          }
        }
      }
    } catch (error) {
      console.error('Error sharing event:', error);
      toast({
        title: "Share Failed ❌",
        description: "Unable to share event. Please try again later.",
        variant: "destructive",
      });
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-retro-cream via-retro-warm-yellow/20 to-retro-deep-teal/10">
    {/* Header */}
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
                    <div className="absolute right-0 top-full mt-2 w-80 bg-retro-navy shadow-lg rounded-lg border-2 border-retro-warm-yellow p-4 z-50 max-h-96 overflow-auto">
                      <div className="space-y-4">
                        {/* Your Events Section */}
                        <div>
                          <h3 className="text-sm font-semibold mb-2 text-retro-cream">Your Events</h3>
                          {userEvents && userEvents.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                              {userEvents.map((event: Event) => (
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
                              {savedEvents.map((event: Event) => (
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
                    {userEvents && userEvents.length > 0 ? (
                      <ul className="space-y-2 text-sm">
                        {userEvents.map((event: Event) => (
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

                    <hr className="my-3 border-retro-cool-teal" />
                    
                    {/* Desktop Saved Events Section */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold mb-2 text-retro-cream flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-400" />
                        Saved Events ({savedEvents.length})
                      </h3>
                      {savedEvents.length > 0 ? (
                        <ul className="space-y-2 text-sm max-h-32 overflow-y-auto">
                          {savedEvents.map((event: Event) => (
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
      <main className="max-w-5xl mx-auto px-3 py-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-retro-navy">
              {activeFilters.includes('All Events') ? 'All Events' : activeFilters.join(', ')}
            </h2>
            <span className="text-sm text-retro-deep-teal">{filteredEvents.length} events</span>
          </div>

          {filteredEvents.length === 0 && searchPerformed && (
            <Card className="text-center py-8 bg-retro-cream border-2 border-retro-mustard">
              <CardContent>
                <div className="text-retro-deep-teal">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-retro-bright-blue" />
                  <h3 className="font-medium mb-2 text-retro-navy">No events found</h3>
                  <p className="text-retro-cool-teal">
                    No events match your search. Try a different keyword.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
            <div className="px-4">
                <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                {filteredEvents.map((event) => (
                  <Card
                  key={event.id}
                  className="
                    relative bg-retro-cream border-4 border-black
                    p-0 overflow-visible transition-all duration-300 ease-out
                    hover:-translate-y-3 hover:rotate-1 rounded-none
                    w-full sm:max-w-lg md:max-w-xl lg:max-w-md shadow-2xl
                    before:content-[''] before:absolute before:top-2 before:left-2 before:-right-2 before:-bottom-2
                    before:bg-retro-burnt-orange/80 before:z-[-1] before:border-4 before:border-black before:rounded-none
                    after:content-[''] after:absolute after:top-4 after:left-4 before:-right-4 before:-bottom-4
                    after:bg-retro-deep-red/70 after:z-[-2] after:border-4 after:border-black after:rounded-none
                    hover:before:translate-x-1 hover:before:translate-y-1
                    hover:after:translate-x-2 hover:after:translate-y-2
                  "
                >
                
                    {/* Card Image or Logo */}
                    <div className="relative h-60 overflow-hidden bg-retro-mustard flex items-center justify-center border-b-4 border-black">
                      {event.image ? (
                        <img src={event.image} alt={event.title} className="object-cover w-full h-full" />
                      ) : (
                        <img
                          src={logo}
                          alt="KwaGround Logo"
                          className="opacity-30 w-40 h-40"
                          style={{ filter: 'grayscale(1)' }}
                        />
                      )}

                      {/* Favorite Button */}
                      <button
                        onClick={() => handleFavoriteToggle(event.id)}
                        disabled={isLoadingFavorites}
                        className="
                          absolute top-3 right-3 p-2 rounded-full 
                          bg-white/90 hover:bg-white shadow-lg
                          transition-all duration-200 transform hover:scale-110
                          border-2 border-black z-10
                          disabled:opacity-50 disabled:cursor-not-allowed
                        "
                        aria-label={favoriteEvents.includes(event.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart 
                          className={`w-5 h-5 transition-colors duration-200 ${
                            favoriteEvents.includes(event.id) 
                              ? 'text-red-500 fill-red-500' 
                              : 'text-gray-600 hover:text-red-500'
                          } ${isLoadingFavorites ? 'animate-pulse' : ''}`}
                        />
                      </button>
                      
                      {/* Category Badge */}
                      <Badge className="
                        absolute top-3 left-3
                        bg-retro-red-orange text-retro-cream
                        font-bold text-xs px-3 py-1
                        border-3 border-black
                        -rotate-3 shadow-lg
                        pointer-events-none
                        transform hover:rotate-0 transition-transform duration-200
                      ">
                        {event.category}
                      </Badge>
                    </div>

                    {/* Card Content */}
                    <CardContent className="
                      bg-retro-cream
                      px-5 py-3 space-y-4 rounded-none
                    ">
                      {/* Title */}
                      <h3 className="
                        font-bold text-xl text-black
                        uppercase tracking-wider
                        transform hover:scale-105 transition-transform duration-200
                      ">
                        {event.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-black text-sm leading-relaxed font-medium break-words max-w-full" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                        {event.description}
                      </p>
                      
                      {/* Info Rows */}
                      <div className="space-y-3 border-t-2 border-black pt-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-black text-sm font-bold">
                            <Calendar className="w-4 h-4 text-retro-bright-blue" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-black text-sm font-bold">
                            <Clock className="w-4 h-4 text-retro-deep-teal" />
                            <span>{formatTime(event.time)}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-black text-sm font-bold">
                            <MapPin className="w-4 h-4 text-retro-red-orange" />
                            <span className="truncate max-w-40">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-black text-sm font-bold">
                            <DollarSign className="w-4 h-4 text-retro-mustard" />
                            <span>
                              {event.price?.trim().toLowerCase() === 'free'
                                ? 'Free'
                                : event.price?.toLowerCase().includes('ksh')
                                  ? event.price
                                  : `KSh ${event.price}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags and Share Button */}
                      <div className="flex justify-between items-end pt-2">
                        <div className="flex flex-wrap gap-2">
                          {event.tags?.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              className="
                                text-xs border-2 border-retro-burnt-orange text-black
                                bg-retro-warm-yellow font-bold px-3 py-1 rounded-none
                                pointer-events-none shadow-sm
                                transform hover:scale-105 transition-all duration-200
                                hover:bg-retro-mustard
                              "
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Share Button */}
                        <button
                          onClick={() => handleShareEvent(event)}
                          className="
                            p-2 rounded-full 
                            bg-retro-bright-blue hover:bg-retro-deep-teal
                            border-2 border-black shadow-lg
                            transition-all duration-200 transform hover:scale-110 hover:-rotate-3
                            group
                          "
                          aria-label={`Share ${event.title}`}
                        >
                          <Share2 className="w-4 h-4 text-white group-hover:text-retro-cream transition-colors duration-200" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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