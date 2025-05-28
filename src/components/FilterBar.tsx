import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabaseClient';

interface FilterBarProps {
  activeFilters: string[];
  onFilterToggle: (filter: string) => void;
}

const retroColorCombos = [
  { bg: 'bg-retro-red-orange', text: 'text-retro-cream', border: 'border-retro-warm-yellow' },
  { bg: 'bg-retro-mustard', text: 'text-black', border: 'border-retro-burnt-orange' },
  { bg: 'bg-retro-deep-teal', text: 'text-retro-cream', border: 'border-retro-bright-blue' },
  { bg: 'bg-retro-bright-blue', text: 'text-retro-cream', border: 'border-retro-warm-yellow' },
  { bg: 'bg-retro-cool-teal', text: 'text-retro-cream', border: 'border-retro-mustard' },
  { bg: 'bg-retro-deep-red', text: 'text-retro-cream', border: 'border-retro-warm-yellow' },
  { bg: 'bg-retro-navy', text: 'text-retro-warm-yellow', border: 'border-retro-burnt-orange' },
  { bg: 'bg-retro-burnt-orange', text: 'text-retro-cream', border: 'border-retro-mustard' },
  { bg: 'bg-retro-warm-yellow', text: 'text-black', border: 'border-retro-deep-red' },
  { bg: 'bg-retro-maroon', text: 'text-retro-cream', border: 'border-retro-warm-yellow' },
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
    <div className="
      bg-retro-cool-teal
      py-2 sticky top-0 z-50 
      border-b-4 border-black
      relative
    ">
      <div className="absolute inset-0 opacity-10 bg-repeat bg-[length:20px_20px]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 10px 10px, rgba(255,175,0,0.3) 1px, transparent 1px)` 
        }}>
      </div>
      
      <div className="w-full overflow-x-auto scrollbar-hide relative z-10">
        <div className="flex space-x-4 px-6 min-w-max">
          <Badge
            onClick={() => onFilterToggle('All Events')}
            className={`
              cursor-pointer whitespace-nowrap transition-all duration-300 ease-out
              font-bold text-xs px-4 py-2
              border-3 shadow-lg transform hover:scale-110 hover:-rotate-1
              relative overflow-hidden
              ${activeFilters.includes('All Events')
                ? `
                  bg-retro-cream text-black border-black
                  hover:shadow-[6px_6px_0px_0px_theme(colors.retro.burnt-orange)]
                  before:content-['★'] before:absolute before:top-0 before:right-1 
                  before:text-retro-red-orange before:text-xs before:animate-pulse
                `
                : `
                  bg-retro-cream text-black border-retro-burnt-orange
                  hover:bg-retro-warm-yellow hover:border-black
                  hover:shadow-[4px_4px_0px_0px_theme(colors.retro.mustard)]
                `}
            `}
          >
            🎪 All Events
          </Badge>

          {categories.map((category, idx) => {
            const isActive = activeFilters.includes(category.name);
            const colorCombo = retroColorCombos[idx % retroColorCombos.length];
            const rotation = idx % 2 === 0 ? 'hover:rotate-1' : 'hover:-rotate-1';
            
            return (
              <Badge
                key={category.id}
                onClick={() => onFilterToggle(category.name)}
                className={`
                  cursor-pointer whitespace-nowrap transition-all duration-300 ease-out
                  font-bold text-xs px-4 py-2 tracking-wider
                  border-3 shadow-lg transform hover:scale-110 ${rotation}
                  relative overflow-hidden
                  ${isActive
                    ? `
                      ${colorCombo.bg} ${colorCombo.text} ${colorCombo.border}
                      shadow-[4px_4px_0px_0px_theme(colors.retro.deep-red)]
                      before:text-retro-warm-yellow before:text-xs before:animate-bounce
                    `
                    : `
                      bg-retro-cream text-black ${colorCombo.border}
                      hover:${colorCombo.bg} hover:${colorCombo.text} hover:border-black
                    `}
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