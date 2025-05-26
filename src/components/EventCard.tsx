import { Calendar, MapPin, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image?: string;
  price?: string;
  tags: string[];
}

const EventCard = ({ 
  title, 
  description, 
  date, 
  time, 
  location, 
  category, 
  image, 
  price, 
  tags 
}: EventCardProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Africa/Nairobi',
    });
  };
  
  function formatTime(date: string, time: string) {
    const fullString = `${date}T${time}`;
    const fullDateTime = new Date(fullString + 'Z');
  
    const timeString = fullDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Nairobi',
    });
    return timeString.replace(/\s/g, '').toLowerCase();
  }

  return (
    <Card
      className="
        relative bg-retro-cream border-4 border-black rounded-2xl shadow-[8px_8px_0_0_#4a274f,16px_16px_0_0_#cb3a2b]
        p-0 overflow-visible transition-transform duration-300 hover:-translate-y-1 hover:shadow-[16px_16px_0_0_#4a274f,24px_24px_0_0_#cb3a2b]
      "
    >
      {/* Card Image or Logo */}
      <div className="relative h-40 rounded-t-2xl overflow-hidden bg-retro-mustard flex items-center justify-center">
        {image ? (
          <img src={image} alt={title} className="object-cover w-full h-full" />
        ) : (
          <img
            src="/assets/kwa-ground-logo.png"
            alt="KwaGround Logo"
            className="opacity-30 w-32 h-32"
            style={{ filter: 'grayscale(1)' }}
          />
        )}
        {/* Category Badge */}
        <Badge className="absolute top-3 left-3 bg-retro-red-orange text-retro-cream font-retro text-base px-4 py-1 rounded-full shadow-lg border-2 border-black">
          {category}
        </Badge>
        {/* Price Badge */}
        {price && (
          <Badge className="absolute top-3 right-3 bg-retro-warm-yellow text-retro-navy font-bold border-2 border-black px-4 py-1 rounded-full shadow-lg">
            {price.trim().toLowerCase() === 'free' ? 'FREE' : price}
          </Badge>
        )}
      </div>

      {/* Card Content */}
      <CardContent className="p-6">
        {/* Title */}
        <h3 className="font-retro text-2xl text-retro-navy mb-2">{title}</h3>
        {/* Description */}
        <p className="text-retro-deep-teal text-base mb-4">
          {description.length > 120 ? description.slice(0, 120) + '...' : description}
        </p>
        {/* Info Rows */}
        <div className="flex justify-between mb-2">
          <div className="flex items-center gap-2 text-retro-cool-teal">
            <Calendar className="w-4 h-4 text-retro-bright-blue" />
            <span className="font-semibold">{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-2 text-retro-cool-teal">
            <Clock className="w-4 h-4 text-retro-deep-teal" />
            <span className="font-semibold">{formatTime(date, time)}</span>
          </div>
        </div>
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2 text-retro-cool-teal">
            <MapPin className="w-4 h-4 text-retro-red-orange" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-retro-cool-teal">
            <DollarSign className="w-4 h-4 text-retro-mustard" />
            <span>
              {price?.trim().toLowerCase() === 'free'
                ? 'Free Entry'
                : price?.toLowerCase().includes('ksh')
                  ? price
                  : `KSh ${price}`}
            </span>
          </div>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs border-retro-mustard text-retro-deep-teal bg-retro-cream font-retro px-3 py-1 rounded-full"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
