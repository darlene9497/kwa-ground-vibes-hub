import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

interface Event {
  id: number;
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
}

interface Profile {
  id: string;
  name: string;
  email: string;
  organization?: string | null;
}

interface EventWithProfile extends Event {
  profiles: Profile; // note plural "profiles" here
}

const AdminPanel = () => {
  const [pendingEvents, setPendingEvents] = useState<EventWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data?.user?.email || null);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchPendingEvents = async () => {
      setLoading(true);

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
        .eq('status', 'pending');

      if (!error && data) {
        setPendingEvents(data);
      } else {
        console.error('Error fetching events:', error);
      }

      setLoading(false);
    };

    if (userEmail === 'nyamburadarlene6974@gmail.com') {
      fetchPendingEvents();
    }
  }, [userEmail]);

  const handleApprove = async (id: number) => {
    const { error } = await supabase
      .from('events')
      .update({ status: 'approved' })
      .eq('id', id);

    if (!error) {
      setPendingEvents((prev) => prev.filter((e) => e.id !== id));
    } else {
      console.error('Error approving event:', error);
    }
  };

  if (userEmail === null) return <p className="p-6">Checking user...</p>;
  if (userEmail !== 'nyamburadarlene6974@gmail.com') return <p className="p-6">Access Denied</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending Events</h1>
      {loading ? (
        <p>Loading events...</p>
      ) : pendingEvents.length === 0 ? (
        <p>No pending events.</p>
      ) : (
        pendingEvents.map((event) => (
          <div key={event.id} className="border p-4 mb-3 rounded-md bg-white shadow">
            <h2 className="font-semibold text-lg">{event.title}</h2>

            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-auto mb-3 rounded"
              />
            )}

            <p className="text-sm text-gray-600 mb-2">{event.description}</p>

            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Time:</strong> {event.time}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Category:</strong> {event.category}</p>
            {event.price && <p><strong>Price:</strong> {event.price}</p>}
            {event.tags && event.tags.length > 0 && (
              <p><strong>Tags:</strong> {event.tags.join(', ')}</p>
            )}

            {event.profiles && (
              <div className="mb-2 text-sm text-gray-700">
                <p><strong>Created by:</strong> {event.profiles.name} ({event.profiles.email})</p>
                {event.profiles.organization && (
                  <p><strong>Organization:</strong> {event.profiles.organization}</p>
                )}
              </div>
            )}

            <Button onClick={() => handleApprove(event.id)}>Approve</Button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminPanel;
