'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface FiltersState {
  genres: string;
  minYear: string;
  maxYear: string;
  rating: string;
  sort: string;
}

interface ProductFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
}

export default function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const handleChange = (key: keyof FiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <Card className="p-4 space-y-6 sticky top-4">
      <div>
        <Label>Category</Label>
        <Select
          value={filters.genres}
          onValueChange={(value) => handleChange('genres', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            <SelectItem value="Action">Action</SelectItem>
            <SelectItem value="Drama">Drama</SelectItem>
            <SelectItem value="Horror">Horror</SelectItem>
            <SelectItem value="Comedy">Comedy</SelectItem>
            <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Price Range</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minYear}
            onChange={(e) => handleChange('minYear', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxYear}
            onChange={(e) => handleChange('maxYear', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Rating</Label>
        <Select
          value={filters.rating}
          onValueChange={(value) => handleChange('rating', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Rating</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="2">2+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Sort By</Label>
        <Select
          value={filters.sort}
          onValueChange={(value) => handleChange('sort', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}