import { useState } from 'react';
import { Plus, Calendar, MapPin, Users, Tag } from 'lucide-react';
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
import { supabase } from '@/lib/supabaseClient';


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


const EventSubmissionModal = ({ onEventAdded }: { onEventAdded?: () => void }) => {
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const rawTags = formData.tags || "";
  const tagArray = rawTags
    .split(",")
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0);

  

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
    
      try {
        // 🔐 Check if user is authenticated
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
    
        if (userError || !user) {
          throw new Error("You must be logged in to submit an event.");
        }
    
        // 📋 Basic form validation
        if (
          !formData.title ||
          !formData.description ||
          !formData.date ||
          !formData.location ||
          !formData.category
        ) {
          throw new Error("Please fill in all required fields.");
        }
    
        let moderationPassed = true;

        // 🧠 OpenAI Text Moderation
        const textModerationRes = await fetch("https://api.openai.com/v1/moderations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            input: `${formData.title}\n${formData.description}`,
          }),
        });
    
        const openaiResult = await textModerationRes.json();
    
        if (!openaiResult.results || openaiResult.results.length === 0) {
          throw new Error("Failed to process text moderation.");
        }
    
        if (openaiResult.results[0].flagged) {
          moderationPassed = false;
        }
    
        // 🖼️ Sightengine Image Moderation
        if (imageFile) {
          const imageFormData = new FormData();
          imageFormData.append("media", imageFile);
          imageFormData.append("models", "nudity,gore,offensive,weapon");
          imageFormData.append("api_user", import.meta.env.VITE_SIGHTENGINE_USER!);
          imageFormData.append("api_secret", import.meta.env.VITE_SIGHTENGINE_SECRET!);
    
          const sightResponse = await fetch("https://api.sightengine.com/1.0/check.json", {
            method: "POST",
            body: imageFormData,
          });
    
          const sightResult = await sightResponse.json();
    
          if (!sightResult || sightResult.status !== "success") {
            throw new Error("Failed to process image moderation.");
          }
    
          const { nudity, gore, offensive, weapon } = sightResult;
    
          if (
            nudity?.raw > 0.4 ||
            gore > 0.3 ||
            weapon > 0.5 ||
            offensive?.prob > 0.4
          ) {
            moderationPassed = false;
          }
        }
    
        // 🔐 Block submission entirely if clearly offensive
        if (!moderationPassed) {
          throw new Error("Your submission was flagged for offensive content and cannot be posted.");
        }
    
        // 👤 Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();
    
        if (profileError || !profile) {
          throw new Error("User profile not found.");
        }
    
        // 💾 Save event to Supabase
        const { error: insertError } = await supabase.from("events").insert([
          {
            title: formData.title,
            description: formData.description,
            date: formData.date,
            time: formData.time,
            location: formData.location,
            category: formData.category,
            price: formData.price,
            tags: tagArray,
            image: imageFile,
            user_id: profile.id,
            status: "approved",
          },
        ]);
    
        if (insertError) {
          throw new Error(insertError.message);
        }
    
        toast({
          title: "Event Submitted 🎉",
          description: "Your event was approved and published. Asante sana!",
        });
    
        // Reset form
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          category: "",
          price: "",
          tags: "",
        });
        setImageFile(null);
        setIsOpen(false);
        onEventAdded?.();
    
      } catch (err: any) {
        toast({
          title: "Submission Error 😞",
          description: err.message || "Something went wrong.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-retro-red-orange hover:bg-retro-deep-red text-retro-cream border-2 border-retro-warm-yellow shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce-gentle z-50"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto bg-retro-cream border-2 border-retro-mustard">
          <DialogHeader className="border-b-2 border-retro-warm-yellow/30 pb-4">
            <DialogTitle className="text-2xl font-bold text-center text-retro-navy">
              Share Your Event
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="title" className="flex items-center mb-2 text-retro-navy">
                <Tag className="w-4 h-4 mr-2 text-retro-bright-blue" />
                Event Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Weekend Jazz at Java House"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="bg-white border-2 border-retro-mustard focus:border-retro-bright-blue focus:ring-retro-bright-blue/20"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-retro-navy">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your event..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                className="min-h-[80px] bg-white border-2 border-retro-mustard focus:border-retro-bright-blue focus:ring-retro-bright-blue/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date" className="flex items-center mb-2 text-retro-navy">
                  <Calendar className="w-4 h-4 mr-2 text-retro-deep-teal" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  className="bg-white border-2 border-retro-mustard focus:border-retro-bright-blue focus:ring-retro-bright-blue/20"
                />
              </div>
              <div>
                <Label htmlFor="time" className="text-retro-navy">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  required
                  className="bg-white border-2 border-retro-mustard focus:border-retro-bright-blue focus:ring-retro-bright-blue/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="flex items-center mb-2 text-retro-navy">
                <MapPin className="w-4 h-4 mr-2 text-retro-red-orange" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Westlands, Nairobi"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
                className="bg-white border-2 border-retro-mustard focus:border-retro-bright-blue focus:ring-retro-bright-blue/20"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-retro-navy">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="bg-white border-2 border-retro-mustard focus:border-retro-bright-blue focus:ring-retro-bright-blue/20">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-retro-cream border-2 border-retro-mustard">
                  {categories.map((category) => (
                    <SelectItem 
                      key={category} 
                      value={category}
                      className="focus:bg-retro-warm-yellow/20 focus:text-retro-navy"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price" className="text-retro-navy">Price</Label>
              <Input
                id="price"
                placeholder="e.g., Free or KSh 1000"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="bg-white border-2 border-retro-mustard focus:border-retro-bright-blue focus:ring-retro-bright-blue/20"
              />
            </div>

            <div>
              <Label htmlFor="tags" className="text-retro-navy">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., music, outdoor, family-friendly"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="bg-white border-2 border-retro-mustard focus:border-retro-bright-blue focus:ring-retro-bright-blue/20"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="image"
                className="cursor-pointer bg-retro-warm-yellow text-retro-navy border-2 border-retro-mustard rounded-full px-6 py-3 text-center font-semibold transition-colors hover:bg-retro-mustard"
              >
                Upload Event Image
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <span className="mt-2 text-retro-navy text-sm">
                {imageFile ? imageFile.name : "No file chosen"}
              </span>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-retro-red-orange hover:bg-retro-deep-red text-retro-cream border-2 border-retro-warm-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Event'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventSubmissionModal;
