
import { Calendar, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const EventCard = ({ 
  title, 
  description, 
  date, 
  time, 
  location, 
  category, 
  image, 
  attendeeCount, 
  price, 
  tags 
}) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Concerts': 'bg-vibrant-purple text-white',
      'Women Only': 'bg-vibrant-pink text-white',
      'Bible Study': 'bg-vibrant-blue text-white',
      'Sip & Paint': 'bg-vibrant-orange text-white',
      'Tech Meetup': 'bg-vibrant-emerald text-white',
      'Fitness': 'bg-kenya-red text-white',
      'Food & Drinks': 'bg-vibrant-yellow text-black',
      'Arts & Culture': 'bg-kenya-green text-white',
    };
    return colors[category] || 'bg-gray-500 text-white';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in">
      <div className="relative">
        <div 
          className="h-48 bg-gradient-to-br from-vibrant-orange to-vibrant-pink"
          style={{
            backgroundImage: image ? `url(${image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!image && (
            <div className="flex items-center justify-center h-full text-white text-6xl font-bold opacity-20">
              {title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <Badge className={`absolute top-3 left-3 ${getCategoryColor(category)}`}>
          {category}
        </Badge>
        {price && (
          <Badge className="absolute top-3 right-3 bg-kenya-gold text-black font-bold">
            {price === 'Free' ? 'FREE' : `KSh ${price}`}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="w-4 h-4 mr-2 text-vibrant-blue" />
            <span>{date}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-4 h-4 mr-2 text-vibrant-emerald" />
            <span>{time}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-vibrant-orange" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <DollarSign className="w-4 h-4 mr-2 text-vibrant-purple" />
            <span>{price === 'Free' ? 'Free Entry' : `KSh ${price}`}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
