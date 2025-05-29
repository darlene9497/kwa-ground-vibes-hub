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
import ProfileDropdown from '@/components/ProfileDropdown';
import EventCard from '@/components/EventCard';
import Header from '@/components/Header';

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

const Index = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>(['All Events']);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userEvents, setUserEvents] = useState<EventType[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<string[]>([]);
  const [savedEvents, setSavedEvents] = useState<EventType[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
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
              })) as unknown as EventType[];
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
              const favoriteIds = favorites?.map(fav => fav.event_id).filter((id): id is number => !!id).map(id => id.toString()) || [];
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
            })) as EventType[];
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
      event.title.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(appliedSearchQuery.toLowerCase());
  
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
            event_id: Number(eventId) // Convert to number
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
            event_id: Number(eventId)
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
    <Header
      user={user}
      displayName={displayName}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      setSearchPerformed={setSearchPerformed}
      profileMenuOpen={profileMenuOpen}
      setProfileMenuOpen={setProfileMenuOpen}
    >
      <ProfileDropdown
        userEvents={userEvents}
        savedEvents={savedEvents}
        profileMenuOpen={profileMenuOpen}
        setProfileMenuOpen={setProfileMenuOpen}
        handleLogout={handleLogout}
        formatDate={formatDate}
      />
    </Header>
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
        {filteredEvents.length === 0 ? (
          searchPerformed ? (
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
          ) : (
            <Card className="text-center py-8 bg-retro-cream border-2 border-retro-mustard">
              <CardContent>
                <div className="text-retro-deep-teal">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-retro-bright-blue" />
                  <h3 className="font-medium mb-2 text-retro-navy">No events found</h3>
                  <p className="text-retro-cool-teal">Try adjusting your filters or search terms.</p>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="px-4">
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  favoriteEvents={favoriteEvents}
                  isLoadingFavorites={isLoadingFavorites}
                  handleFavoriteToggle={handleFavoriteToggle}
                  handleShareEvent={handleShareEvent}
                  logo={logo}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
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