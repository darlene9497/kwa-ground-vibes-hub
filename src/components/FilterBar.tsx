
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterBarProps {
  activeFilters: string[];
  onFilterToggle: (filter: string) => void;
}

const FilterBar = ({ activeFilters, onFilterToggle }: FilterBarProps) => {
  const filters = [
    { name: 'All Events', color: 'bg-gray-500' },
    { name: 'Women Only', color: 'bg-vibrant-pink' },
    { name: 'Concerts', color: 'bg-vibrant-purple' },
    { name: 'Bible Study', color: 'bg-vibrant-blue' },
    { name: 'Sip & Paint', color: 'bg-vibrant-orange' },
    { name: 'Tech Meetup', color: 'bg-vibrant-emerald' },
    { name: 'Fitness', color: 'bg-kenya-red' },
    { name: 'Food & Drinks', color: 'bg-vibrant-yellow' },
    { name: 'Arts & Culture', color: 'bg-kenya-green' },
  ];

  return (
    <div className="bg-white py-4 sticky top-0 z-10 border-b">
      <ScrollArea className="w-full">
        <div className="flex space-x-3 px-4">
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter.name);
            return (
              <Badge
                key={filter.name}
                onClick={() => onFilterToggle(filter.name)}
                className={`
                  cursor-pointer whitespace-nowrap transition-all duration-200 hover:scale-105
                  ${isActive 
                    ? `${filter.color} text-white shadow-lg` 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  ${filter.name === 'Food & Drinks' && isActive ? 'text-black' : ''}
                `}
              >
                {filter.name}
              </Badge>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FilterBar;
