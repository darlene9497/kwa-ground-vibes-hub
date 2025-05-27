import { useEffect, useState } from 'react';
import { CheckCircle, Clock, MapPin, Tag, User, Building, DollarSign, Calendar, Eye, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image?: string;
  price?: string;
  tags?: string[];
  user_id: string;
  status: string;
  created_at?: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  organization?: string | null;
}

interface EventWithProfile extends Event {
  profiles: Profile;
}

const AdminPanel = () => {
  const [pendingEvents, setPendingEvents] = useState<EventWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [processingEvents, setProcessingEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === 'nyamburadarlene6974@gmail.com') {
        setUserEmail(user.email);
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchPendingEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            profiles:user_id (
              id,
              name,
              email,
              organization
            )
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching pending events:', error);
          return;
        }

        const eventsWithProfiles: EventWithProfile[] = data.map(event => ({
          ...event,
          profiles: event.profiles
        }));

        setPendingEvents(eventsWithProfiles);
      } catch (err) {
        console.error('Error in fetchPendingEvents:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail === 'nyamburadarlene6974@gmail.com') {
      fetchPendingEvents();
    }
  }, [userEmail]);

  const handleApprove = async (id: string) => {
    setProcessingEvents(prev => new Set(prev).add(id));
    
    try {
      const event = pendingEvents.find(e => e.id === id);
      if (!event) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', event.user_id)
        .single();

      if (profileError || !profile) {
        throw new Error('Could not fetch user email for notification.');
      }

      const { error: updateError } = await supabase
        .from('events')
        .update({ status: 'approved' })
        .eq('id', id);

      if (updateError) throw updateError;

      const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'event_approved',
          to: profile.email,
          eventData: {
            title: event.title,
            date: event.date,
            location: event.location
          }
        }
      });

      if (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      setPendingEvents((prev) => prev.filter((e) => e.id !== id));
      
    } catch (error) {
      console.error('Error approving event:', error);
    } finally {
      setProcessingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (userEmail === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#efd2b2' }}>
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 rounded-full mx-auto mb-4" style={{ borderColor: '#e1aa38', borderTopColor: '#0576a0' }}></div>
          <p className="text-xl font-semibold" style={{ color: '#03223a' }}>Checking credentials...</p>
        </div>
      </div>
    );
  }
  
  if (userEmail !== 'nyamburadarlene6974@gmail.com') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#efd2b2' }}>
        <div 
          className="p-8 rounded-2xl border-4 text-center max-w-md"
          style={{ 
            backgroundColor: '#ffffff',
            borderColor: '#cb3a2b',
            boxShadow: '0 20px 40px rgba(203, 58, 43, 0.3)'
          }}
        >
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#cb3a2b' }}>Access Denied</h2>
          <p style={{ color: '#03223a' }}>You don't have permission to access this admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#efd2b2' }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-10 border-b-4 p-6"
        style={{ 
          background: 'linear-gradient(135deg, #00495e 0%, #0576a0 100%)',
          borderColor: '#ffaf00',
          boxShadow: '0 8px 32px rgba(0, 73, 94, 0.3)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center" style={{ color: '#efd2b2', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                <Sparkles className="w-10 h-10 mr-3" />
                Admin Control Center
              </h1>
              <p className="text-xl mt-2 opacity-90" style={{ color: '#efd2b2' }}>
                Managing the magic, one event at a time ✨
              </p>
            </div>
            <div 
              className="px-6 py-3 rounded-full border-2 font-semibold"
              style={{ 
                backgroundColor: '#ffaf00',
                borderColor: '#e1aa38',
                color: '#03223a'
              }}
            >
              {pendingEvents.length} Events Pending
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-pulse space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full" style={{ backgroundColor: '#ffaf00' }}></div>
              <p className="text-2xl font-semibold" style={{ color: '#03223a' }}>
                Loading pending events...
              </p>
            </div>
          </div>
        ) : pendingEvents.length === 0 ? (
          <div 
            className="text-center py-20 rounded-2xl border-4"
            style={{ 
              backgroundColor: '#ffffff',
              borderColor: '#e1aa38',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
            }}
          >
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#00495e' }}>
              All Caught Up!
            </h2>
            <p className="text-xl" style={{ color: '#03223a' }}>
              No pending events to review right now.
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {pendingEvents.map((event, index) => (
              <div 
                key={event.id}
                className="rounded-2xl border-4 overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                style={{ 
                  backgroundColor: '#ffffff',
                  borderColor: '#e1aa38',
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Event Header */}
                <div 
                  className="p-6 border-b-4"
                  style={{ 
                    background: 'linear-gradient(135deg, #ffaf00 0%, #e1aa38 100%)',
                    borderColor: '#00495e'
                  }}
                >
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#03223a', textShadow: '1px 1px 2px rgba(255,255,255,0.5)' }}>
                    {event.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm font-medium" style={{ color: '#03223a' }}>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {event.date}
                    </span>
                    {event.time && (
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {event.time}
                      </span>
                    )}
                    <span 
                      className="px-3 py-1 rounded-full border-2"
                      style={{ 
                        backgroundColor: '#efd2b2',
                        borderColor: '#03223a',
                        color: '#03223a'
                      }}
                    >
                      {event.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Event Image */}
                    {event.image && (
                      <div className="lg:col-span-1">
                        <div className="relative overflow-hidden rounded-xl border-3" style={{ borderColor: '#e1aa38' }}>
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                          />
                          <div 
                            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4"
                          >
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Event Details */}
                    <div className={event.image ? "lg:col-span-2" : "lg:col-span-3"}>
                      <div className="space-y-4">
                        {/* Description */}
                        <div>
                          <p className="text-lg leading-relaxed" style={{ color: '#03223a' }}>
                            {event.description}
                          </p>
                        </div>

                        {/* Event Info Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <MapPin className="w-5 h-5 mr-3" style={{ color: '#9a2907' }} />
                              <span className="font-medium" style={{ color: '#03223a' }}>{event.location}</span>
                            </div>
                            
                            {event.price && (
                              <div className="flex items-center">
                                <DollarSign className="w-5 h-5 mr-3" style={{ color: '#00495e' }} />
                                <span className="font-medium" style={{ color: '#03223a' }}>{event.price}</span>
                              </div>
                            )}
                          </div>

                          {event.tags && event.tags.length > 0 && (
                            <div>
                              <div className="flex items-center mb-2">
                                <Tag className="w-5 h-5 mr-2" style={{ color: '#0576a0' }} />
                                <span className="font-medium" style={{ color: '#03223a' }}>Tags:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {event.tags.map((tag, i) => (
                                  <span 
                                    key={i}
                                    className="px-3 py-1 rounded-full text-sm font-medium border-2"
                                    style={{ 
                                      backgroundColor: '#efd2b2',
                                      borderColor: '#0576a0',
                                      color: '#03223a'
                                    }}
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Creator Info */}
                        {event.profiles && (
                          <div 
                            className="p-4 rounded-xl border-2"
                            style={{ 
                              backgroundColor: '#efd2b2',
                              borderColor: '#e1aa38'
                            }}
                          >
                            <div className="flex items-center mb-2">
                              <User className="w-5 h-5 mr-2" style={{ color: '#00495e' }} />
                              <span className="font-semibold" style={{ color: '#03223a' }}>Event Creator</span>
                            </div>
                            <p className="font-medium" style={{ color: '#03223a' }}>
                              {event.profiles.name} • {event.profiles.email}
                            </p>
                            {event.profiles.organization && (
                              <div className="flex items-center mt-1">
                                <Building className="w-4 h-4 mr-2" style={{ color: '#9a2907' }} />
                                <span style={{ color: '#03223a' }}>{event.profiles.organization}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Approve Button */}
                        <div className="pt-4">
                          <button
                            onClick={() => handleApprove(event.id)}
                            disabled={processingEvents.has(event.id)}
                            className="w-full py-4 rounded-xl font-bold text-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center justify-center"
                            style={{ 
                              background: processingEvents.has(event.id) 
                                ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
                                : 'linear-gradient(135deg, #00495e 0%, #0576a0 100%)',
                              color: '#efd2b2',
                              border: '3px solid #ffaf00',
                              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                              boxShadow: '0 8px 25px rgba(0, 73, 94, 0.4)'
                            }}
                          >
                            {processingEvents.has(event.id) ? (
                              <>
                                <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full mr-3"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-6 h-6 mr-3" />
                                ✨ Approve Event ✨
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;