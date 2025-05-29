import React from 'react';
import { Calendar, Clock, MapPin, DollarSign, Heart, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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

interface EventCardProps {
  event: EventType;
  favoriteEvents: string[];
  isLoadingFavorites: boolean;
  handleFavoriteToggle: (eventId: string) => void;
  handleShareEvent: (event: EventType) => void;
  logo: string;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  favoriteEvents,
  isLoadingFavorites,
  handleFavoriteToggle,
  handleShareEvent,
  logo,
  formatDate,
  formatTime,
}) => (
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
        <img src={event.image} alt={event.title} className="object-cover w-full h-full pointer-events-none" />
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
          absolute z-0 top-3 right-3 p-2 rounded-full 
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
            <span>{event.location}</span>
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
);

export default EventCard; 