import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const filterOptions = ["Headphone Type", "Price", "Review", "Color", "Material", "Offer"];

const FilterBar = () => {
  return (
    <div className="mb-8 p-4 bg-card rounded-lg shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <Button key={option} variant="outline" size="sm" className="text-sm">
              {option}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="text-sm text-primary hover:text-primary/80">
            All Filters
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Sort By:</span>
          <Select defaultValue="featured">
            <SelectTrigger className="w-auto md:w-[180px] text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Avg. Customer Review</SelectItem>
              <SelectItem value="newest">Newest Arrivals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
