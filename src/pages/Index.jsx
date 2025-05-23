
import { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import EventCard from '@/components/EventCard';
import FilterBar from '@/components/FilterBar';
import AIRecommendations from '@/components/AIRecommendations';
import EventSubmissionModal from '@/components/EventSubmissionModal';

const Index = () => {
  const [activeFilters, setActiveFilters] = useState(['All Events']);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);

  // Mock event data
  const mockEvents = [
    {
      id: 1,
      title: "Rooftop Jazz Night",
      description: "Smooth jazz under the Nairobi stars with local and international artists",
      date: "Dec 15, 2024",
      time: "7:00 PM",
      location: "Sky Lounge, Westlands",
      category: "Concerts",
      image: "https://images.unsplash.com/photo-1500673922987-e212871fec22",
      attendeeCount: 89,
      price: "1500",
      tags: ["jazz", "music", "rooftop", "nightlife"]
    },
    {
      id: 2,
      title: "Sisterhood Circle: Empowerment Workshop",
      description: "A safe space for women to network, learn, and grow together",
      date: "Dec 12, 2024",
      time: "2:00 PM",
      location: "Panari Hotel, Kilimani",
      category: "Women Only",
      attendeeCount: 45,
      price: "Free",
      tags: ["networking", "empowerment", "workshop", "women"]
    },
    {
      id: 3,
      title: "React & TypeScript Meetup",
      description: "Join fellow developers to discuss the latest in React ecosystem",
      date: "Dec 18, 2024",
      time: "6:00 PM",
      location: "iHub, Nairobi",
      category: "Tech Meetup",
      attendeeCount: 67,
      price: "Free",
      tags: ["tech", "programming", "react", "typescript"]
    },
    {
      id: 4,
      title: "Paint & Wine Evening",
      description: "Unleash your creativity while sipping on fine wines",
      date: "Dec 14, 2024",
      time: "5:30 PM",
      location: "Art Café, Karen",
      category: "Sip & Paint",
      attendeeCount: 28,
      price: "2500",
      tags: ["art", "wine", "creative", "relaxing"]
    },
    {
      id: 5,
      title: "Young Adults Bible Study",
      description: "Growing in faith together through interactive discussions",
      date: "Dec 16, 2024",
      time: "11:00 AM",
      location: "Nairobi Chapel, Valley Road",
      category: "Bible Study",
      attendeeCount: 32,
      price: "Free",
      tags: ["faith", "community", "discussion", "growth"]
    },
    {
      id: 6,
      title: "Afrobeats Fitness Class",
      description: "High-energy workout session to the best Afrobeats hits",
      date: "Dec 13, 2024",
      time: "6:30 AM",
      location: "Uhuru Park",
      category: "Fitness",
      attendeeCount: 54,
      price: "500",
      tags: ["fitness", "dance", "afrobeats", "outdoor"]
    }
  ];

  useEffect(() => {
    // Simulate loading events
    setEvents(mockEvents);
  }, []);

  const handleFilterToggle = (filter) => {
    if (filter === 'All Events') {
      setActiveFilters(['All Events']);
    } else {
      const newFilters = activeFilters.includes(filter)
        ? activeFilters.filter(f => f !== filter)
        : [...activeFilters.filter(f => f !== 'All Events'), filter];
      
      setActiveFilters(newFilters.length === 0 ? ['All Events'] : newFilters);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = activeFilters.includes('All Events') || 
                         activeFilters.includes(event.category);
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-vibrant-orange to-vibrant-pink bg-clip-text text-transparent">
              KwaGround
            </h1>
            <div className="flex items-center justify-center text-sm text-gray-600 mt-1">
              <MapPin className="w-4 h-4 mr-1 text-vibrant-blue" />
              <span>Nairobi, Kenya</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events, locations, or vibes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar 
        activeFilters={activeFilters}
        onFilterToggle={handleFilterToggle}
      />

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* AI Recommendations */}
        <AIRecommendations />

        {/* Events Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeFilters.includes('All Events') ? 'All Events' : activeFilters.join(', ')}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredEvents.length} events
            </span>
          </div>
          
          {filteredEvents.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <div className="text-gray-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="font-medium mb-2">No events found</h3>
                  <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Spacing for FAB */}
        <div className="h-20"></div>
      </main>

      {/* Floating Action Button */}
      <EventSubmissionModal />
    </div>
  );
};

export default Index;
