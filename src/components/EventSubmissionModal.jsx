
import { useState } from 'react';
import { Plus, Calendar, MapPin, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const EventSubmissionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    price: '',
    tags: ''
  });

  const categories = [
    'Concerts',
    'Women Only',
    'Bible Study',
    'Sip & Paint',
    'Tech Meetup',
    'Fitness',
    'Food & Drinks',
    'Arts & Culture'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Event Submitted! 🎉",
      description: "Your event will be reviewed and published soon. Asante sana!",
    });

    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: '',
      price: '',
      tags: ''
    });
    
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-vibrant-orange to-vibrant-pink shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce-gentle z-50"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-vibrant-orange to-vibrant-pink bg-clip-text text-transparent">
              Share Your Event
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="flex items-center mb-2">
                <Tag className="w-4 h-4 mr-2 text-vibrant-blue" />
                Event Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Weekend Jazz at Java House"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your event..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date" className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-vibrant-emerald" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center mb-2">
                <MapPin className="w-4 h-4 mr-2 text-vibrant-orange" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Westlands, Nairobi"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price (KSh or Free)</Label>
              <Input
                id="price"
                placeholder="e.g., 500 or Free"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., music, outdoor, networking"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-vibrant-orange to-vibrant-pink hover:from-vibrant-pink hover:to-vibrant-orange transition-all duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Event'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventSubmissionModal;
