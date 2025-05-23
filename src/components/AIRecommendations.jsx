
import { Sparkles, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AIRecommendations = ({ userLocation = "Nairobi", userAge = 25 }) => {
  const recommendations = [
    {
      title: "Weekend Vibes: Rooftop Concert",
      reason: "Perfect for your age group and music taste",
      confidence: 95,
      location: "Westlands",
      category: "Concerts"
    },
    {
      title: "Tech Startup Networking",
      reason: "Based on your professional interests",
      confidence: 88,
      location: "iHub",
      category: "Tech Meetup"
    },
    {
      title: "Sisterhood Paint & Sip",
      reason: "Popular with young professionals in Nairobi",
      confidence: 82,
      location: "Kilimani",
      category: "Women Only"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-vibrant-blue/10 to-vibrant-purple/10 border-vibrant-blue/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Sparkles className="w-5 h-5 mr-2 text-vibrant-purple" />
          AI Picks for You
        </CardTitle>
        <p className="text-sm text-gray-600">
          Based on your location in {userLocation} and preferences
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-white p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-sm text-gray-900">{rec.title}</h4>
              <Badge variant="outline" className="text-xs">
                {rec.confidence}% match
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mb-2">{rec.reason}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {rec.location}
              </div>
              <Badge className="text-xs bg-vibrant-emerald text-white">
                {rec.category}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
