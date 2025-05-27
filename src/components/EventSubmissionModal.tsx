import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Tag, Camera, Clock, FileText, DollarSign, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const EventSubmissionModal = ({ onEventAdded }: { onEventAdded?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
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

  const DESCRIPTION_LIMIT = 300;
  const descriptionLength = formData.description.length;
  const descriptionRemaining = DESCRIPTION_LIMIT - descriptionLength;

  const rawTags = formData.tags || "";
  const tagArray = rawTags
    .split(",")
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name');

        if (error) {
          console.error('Error fetching categories:', error);
          // Fallback categories if fetch fails
          setCategories([
            'Concerts',
            'Women Only',
            'Bible Study',
            'Sip & Paint',
            'Tech Meetup',
            'Fitness',
            'Food & Drinks',
            'Arts & Culture'
          ]);
        } else {
          setCategories(data.map(cat => cat.name));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback categories
        setCategories([
          'Concerts',
          'Women Only',
          'Bible Study',
          'Sip & Paint',
          'Tech Meetup',
          'Fitness',
          'Food & Drinks',
          'Arts & Culture'
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Function to send email notifications using Supabase Edge Functions
  const sendEmailNotifications = async (eventData: any, userEmail: string) => {
    try {
      // Send notification to admin about new event submission using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'new_event_submission',
          to: 'nyamburadarlene6974@gmail.com',
          eventData: eventData,
          userEmail: userEmail
        }
      });

      if (error) {
        console.error('Failed to send admin notification email:', error);
      }

    } catch (error) {
      console.error('Error sending email notifications:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("You must be logged in to submit an event.");
      }

      // Basic form validation
      if (!formData.title || !formData.description || !formData.date || !formData.location || !formData.category) {
        throw new Error("Please fill in all required fields.");
      }

      // Validate description length
      if (formData.description.length > DESCRIPTION_LIMIT) {
        throw new Error(`Description must be ${DESCRIPTION_LIMIT} characters or less.`);
      }

      // Handle image upload
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw new Error("Failed to upload image.");
        }

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("User profile not found.");
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        category: formData.category,
        price: formData.price,
        tags: tagArray,
        image: imageUrl,
        user_id: profile.id,
        status: "pending", // All events need admin approval
      };

      const { error: insertError } = await supabase.from("events").insert([eventData]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Send email notifications
      await sendEmailNotifications(eventData, user.email || '');

      toast({
        title: "Event Submitted 📝",
        description: "Your event has been submitted and is pending admin approval. You can track its status in your profile.",
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

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= DESCRIPTION_LIMIT) {
      setFormData({...formData, description: value});
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 z-50 border-4 border-yellow-400 animate-pulse"
        style={{ 
          background: 'linear-gradient(135deg, #9a2907 0%, #cb3a2b 100%)',
          borderColor: '#ffaf00',
          boxShadow: '0 8px 32px rgba(154, 41, 7, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        <Plus className="h-8 w-8 mx-auto drop-shadow-lg" />
      </button>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        // Close modal when clicking outside
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <div 
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border-4 transform animate-in fade-in-0 zoom-in-95 duration-300"
        style={{ 
          backgroundColor: '#efd2b2',
          borderColor: '#e1aa38',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-6 border-b-4 relative overflow-hidden"
          style={{ 
            borderColor: '#ffaf00',
            background: 'linear-gradient(135deg, #00495e 0%, #0576a0 100%)'
          }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-4 w-8 h-8 bg-white rounded-full"></div>
            <div className="absolute top-8 right-8 w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute bottom-4 left-8 w-6 h-6 bg-white rounded-full"></div>
          </div>
          <h2 className="text-lg font-bold text-center relative z-10" style={{ color: '#efd2b2', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            ✨ Share Your Event ✨
          </h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Event Title */}
          <div className="relative">
            <label className="flex items-center mb-3 text-lg font-semibold" style={{ color: '#03223a' }}>
              <Tag className="w-5 h-5 mr-2" style={{ color: '#0576a0' }} />
              Event Title
            </label>
            <input
              type="text"
              placeholder="e.g., Weekend Jazz at Java House"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              className="w-full px-4 py-3 rounded-xl border-3 font-medium text-lg transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
              style={{ 
                backgroundColor: '#ffffff',
                borderColor: '#e1aa38',
                color: '#03223a'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0576a0'}
              onBlur={(e) => e.target.style.borderColor = '#e1aa38'}
            />
          </div>

          {/* Description with Character Counter */}
          <div className="relative">
            <label className="flex items-center mb-3 text-lg font-semibold" style={{ color: '#03223a' }}>
              <FileText className="w-5 h-5 mr-2" style={{ color: '#00495e' }} />
              Description
            </label>
            <div className="relative">
              <textarea
                placeholder="Tell us about your amazing event..."
                value={formData.description}
                onChange={handleDescriptionChange}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-3 font-medium resize-none transition-all duration-300 focus:scale-[1.02] focus:shadow-lg pr-20"
                style={{ 
                  backgroundColor: '#ffffff',
                  borderColor: descriptionRemaining < 50 ? '#cb3a2b' : '#e1aa38',
                  color: '#03223a'
                }}
                onFocus={(e) => e.target.style.borderColor = descriptionRemaining < 50 ? '#cb3a2b' : '#0576a0'}
                onBlur={(e) => e.target.style.borderColor = descriptionRemaining < 50 ? '#cb3a2b' : '#e1aa38'}
              />
              <div 
                className="absolute bottom-3 right-3 text-sm font-semibold px-2 py-1 rounded"
                style={{
                  color: descriptionRemaining < 50 ? '#cb3a2b' : descriptionRemaining < 100 ? '#ff8c00' : '#00495e',
                  backgroundColor: descriptionRemaining < 50 ? '#fff1f0' : descriptionRemaining < 100 ? '#fff8f0' : '#f0f8ff'
                }}
              >
                {descriptionRemaining}/{DESCRIPTION_LIMIT}
              </div>
            </div>
            <p 
              className="text-sm mt-1"
              style={{ 
                color: descriptionRemaining < 50 ? '#cb3a2b' : '#03223a',
                opacity: descriptionRemaining < 50 ? 1 : 0.7
              }}
            >
              {descriptionRemaining < 50 
                ? `⚠️ Only ${descriptionRemaining} characters remaining!`
                : `${descriptionLength}/${DESCRIPTION_LIMIT} characters used`
              }
            </p>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center mb-3 text-lg font-semibold" style={{ color: '#03223a' }}>
                <Calendar className="w-5 h-5 mr-2" style={{ color: '#00495e' }} />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-xl border-3 font-medium transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                style={{ 
                  backgroundColor: '#ffffff',
                  borderColor: '#e1aa38',
                  color: '#03223a'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0576a0'}
                onBlur={(e) => e.target.style.borderColor = '#e1aa38'}
              />
            </div>
            <div>
              <label className="flex items-center mb-3 text-lg font-semibold" style={{ color: '#03223a' }}>
                <Clock className="w-5 h-5 mr-2" style={{ color: '#00495e' }} />
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-3 font-medium transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                style={{ 
                  backgroundColor: '#ffffff',
                  borderColor: '#e1aa38',
                  color: '#03223a'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0576a0'}
                onBlur={(e) => e.target.style.borderColor = '#e1aa38'}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center mb-3 text-lg font-semibold" style={{ color: '#03223a' }}>
              <MapPin className="w-5 h-5 mr-2" style={{ color: '#9a2907' }} />
              Location
            </label>
            <input
              type="text"
              placeholder="e.g., Westlands, Nairobi"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
              className="w-full px-4 py-3 rounded-xl border-3 font-medium transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
              style={{ 
                backgroundColor: '#ffffff',
                borderColor: '#e1aa38',
                color: '#03223a'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0576a0'}
              onBlur={(e) => e.target.style.borderColor = '#e1aa38'}
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center mb-3 text-lg font-semibold" style={{ color: '#03223a' }}>
              <Users className="w-5 h-5 mr-2" style={{ color: '#0576a0' }} />
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
              disabled={loadingCategories}
              className="w-full px-4 py-3 rounded-xl border-3 font-medium transition-all duration-300 focus:scale-[1.02] focus:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#ffffff',
                borderColor: '#e1aa38',
                color: '#03223a'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0576a0'}
              onBlur={(e) => e.target.style.borderColor = '#e1aa38'}
            >
              <option value="">
                {loadingCategories ? "Loading categories..." : "Select a category"}
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="flex items-center mb-3 text-lg font-semibold" style={{ color: '#03223a' }}>
              <DollarSign className="w-5 h-5 mr-2" style={{ color: '#9a2907' }} />
              Price
            </label>
            <input
              type="text"
              placeholder="e.g., Free or KSh 1000"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-3 font-medium transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
              style={{ 
                backgroundColor: '#ffffff',
                borderColor: '#e1aa38',
                color: '#03223a'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0576a0'}
              onBlur={(e) => e.target.style.borderColor = '#e1aa38'}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center mb-3 text-lg font-semibold" style={{ color: '#03223a' }}>
              <Hash className="w-5 h-5 mr-2" style={{ color: '#00495e' }} />
              Tags
            </label>
            <input
              type="text"
              placeholder="e.g., music, outdoor, family-friendly"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border-3 font-medium transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
              style={{ 
                backgroundColor: '#ffffff',
                borderColor: '#e1aa38',
                color: '#03223a'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0576a0'}
              onBlur={(e) => e.target.style.borderColor = '#e1aa38'}
            />
            <p className="text-xs mt-1 opacity-70" style={{ color: '#03223a' }}>
              Separate tags with commas
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block mb-3 text-lg font-semibold" style={{ color: '#03223a' }}>
              <Camera className="w-5 h-5 inline mr-2" style={{ color: '#9a2907' }} />
              Event Image
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="w-full px-6 py-4 rounded-xl border-3 border-dashed cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex flex-col items-center justify-center text-center font-medium"
                style={{ 
                  backgroundColor: '#ffffff',
                  borderColor: '#ffaf00',
                  color: '#03223a'
                }}
              >
                <Camera className="w-8 h-8 mb-2" style={{ color: '#9a2907' }} />
                {imageFile ? (
                  <span className="text-green-600 font-semibold">📸 {imageFile.name}</span>
                ) : (
                  <>
                    <span className="font-semibold">Click to upload image</span>
                    <span className="text-sm opacity-70">Optional - Make your event stand out</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || descriptionLength > DESCRIPTION_LIMIT}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            style={{ 
              background: 'linear-gradient(135deg, #9a2907 0%, #cb3a2b 100%)',
              color: '#efd2b2',
              border: '3px solid #ffaf00',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              boxShadow: '0 8px 25px rgba(154, 41, 7, 0.4)'
            }}
          >
            {isSubmitting ? '🚀 Launching Event...' : '🎉 Submit Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventSubmissionModal;