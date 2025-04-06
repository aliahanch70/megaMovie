'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FiltersState {
  genres: string;
  minYear: string;
  maxYear: string;
  rating: string;
  sort: string;
  imdb: string;
  type: string;
}

interface ProductFiltersProps {
  filters: {
    genres: string;
    minYear: string;
    maxYear: string;
    rating: string;
    sort: string;
    imdb: string;
    type: string;
  };
  onChange: (filters: {
    genres: string;
    minYear: string;
    maxYear: string;
    rating: string;
    sort: string;
    imdb: string;
    type: string;
  }) => void;
}

export default function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const handleChange = (key: keyof FiltersState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="relative">
      {/* دکمه باز/بسته کردن در موبایل */}
      <button
        className="md:hidden w-full text-left p-2 bg-black hover:bg-neutral-950 rounded-md flex items-center justify-between border border-neutral-800"
        onClick={toggleCollapse}
      >
        فیلترها
        {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {/* کارت فیلترها */}
      <Card
        className={`p-4 space-y-6 sticky top-4 md:block ${
          isCollapsed ? 'hidden' : ''
        }`}
      >
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
          <Label>Year Range</Label>
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
            value={filters.imdb}
            onValueChange={(value) => handleChange('imdb', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Rating</SelectItem>
              <SelectItem value="7.5">7.5+ Stars</SelectItem>
              <SelectItem value="6">6+ Stars</SelectItem>
              <SelectItem value="5">5+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Type</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => handleChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Type</SelectItem>
              <SelectItem value="Movie">Movie</SelectItem>
              <SelectItem value="Series">Series</SelectItem>
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
              <SelectItem value="imdb-desc">IMDB: High to Low</SelectItem>
              <SelectItem value="year-desc">Year: New First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </div>
  );
}