import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabaseClient';

interface FilterBarProps {
  activeFilters: string[];
  onFilterToggle: (filter: string) => void;
}

const retroTextColors = [
  'text-retro-red-orange',
  'text-retro-mustard',
  'text-retro-deep-teal',
  'text-retro-bright-blue',
  'text-retro-cool-teal',
  'text-retro-deep-red',
  'text-retro-burnt-orange',
  'text-retro-maroon',
  'text-retro-deep-purple',
  'text-retro-deep-blue',
];

const retroBgColors = [
  'bg-retro-red-orange',
  'bg-retro-mustard',
  'bg-retro-deep-teal',
  'bg-retro-bright-blue',
  'bg-retro-cool-teal',
  'bg-retro-deep-red',
  'bg-retro-navy',
  'bg-retro-burnt-orange',
  'bg-retro-warm-yellow',
];

const FilterBar = ({ activeFilters, onFilterToggle }: FilterBarProps) => {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data);
      }
    };

    fetchCategories();
  }, [supabase]);

  return (
    <div className="bg-retro-cool-teal py-4 sticky top-0 z-10 border-b-2 border-retro-mustard">
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex space-x-3 px-4 min-w-max">
          {/* Default "All Events" */}
          <Badge
            onClick={() => onFilterToggle('All Events')}
            className={`
              cursor-pointer whitespace-nowrap transition-all duration-200 hover:scale-105
              border-2 ${activeFilters.includes('All Events')
                ? 'border-retro-cream bg-retro-navy text-retro-cream shadow-lg'
                : 'bg-retro-cream text-retro-navy border-transparent'}
            `}
          >
            All Events
          </Badge>
  
          {/* Dynamic categories */}
          {categories.map((category, idx) => {
            const isActive = activeFilters.includes(category.name);
            const textColor = retroTextColors[idx % retroTextColors.length];
            const bgColor = retroBgColors[idx % retroBgColors.length];
  
            return (
              <Badge
                key={category.id}
                onClick={() => onFilterToggle(category.name)}
                className={`
                  cursor-pointer whitespace-nowrap transition-all duration-200 hover:scale-105
                  border-2 ${isActive
                    ? `border-retro-cream ${bgColor} ${textColor} shadow-lg`
                    : `border-transparent bg-retro-cream ${textColor}`}
                `}
              >
                {category.name}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
  
};

export default FilterBar;
