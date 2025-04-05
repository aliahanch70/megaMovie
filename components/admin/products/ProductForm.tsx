'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { validateImageFile } from '@/lib/utils/validation';
import { uploadImageToPublic } from '@/lib/utils/uploadImage';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import MovieSearchPopup from '@/components/MovieSearchPopup';
import { set } from 'lodash';

interface MovieFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  initialData?: any;
}

interface CastMember {
  name: string;
  role: string;
}

interface MovieLink {
  title: string;
  url: string;
  quality: string;
  size: string;
  encode: string;
  optionValues: { [key: string]: string };
}

interface Option {
  name: string;
  values: string[];
}

interface MetaTag {
  key: string;
  value: string;
}

export default function MovieForm({ onSubmit, loading, initialData }: MovieFormProps) {
  const [images, setImages] = useState<Array<{ file: File | string; label: string }>>([]);
  const [cast, setCast] = useState<CastMember[]>(initialData?.cast || []);
  const [links, setLinks] = useState<MovieLink[]>(initialData?.movie_links || []);
  const [options, setOptions] = useState<Option[]>(initialData?.movie_options || []);
  const [metaTags, setMetaTags] = useState<MetaTag[]>(initialData?.meta_tags || [{ key: '', value: '' }]);
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialData?.genres || []);
  const [imdb, setImdb] = useState(initialData?.imdb || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [release, setRelease] = useState(initialData?.release || '');
  const [director, setDirector] = useState(initialData?.director || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [language, setLanguage] = useState(initialData?.language || '');
  const [type, setType] = useState<string>(initialData?.type || 'Movie'); // مقدار پیش‌فرض "Movie"
  const [imdbId, setImdbId] = useState(initialData?.imdb_id || '');

  useEffect(() => {
    if (initialData) {
      const initialImages = initialData.movie_images?.map((img: any) => ({
        file: img.url,
        label: img.label || '',
      })) || [];
      setImages(initialImages);

      const initialLinks = initialData.movie_links?.map((link: any) => ({
        title: link.title,
        url: link.url,
        quality: link.quality || '',
        size: link.size || '',
        encode: link.encode || '',
        optionValues: link.option_values || {},
      })) || [];
      setLinks(initialLinks);

      setCast(initialData.cast || []);
      setOptions(initialData.movie_options || []);
      setMetaTags(initialData.meta_tags || [{ key: '', value: '' }]);
      setSelectedGenres(initialData.genres || []);

      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setRelease(initialData.release || '');
      setDirector(initialData.director || '');
      setDuration(initialData.duration || '');
      setLanguage(initialData.language || '');
      setImdb(initialData.imdb || '');
      setType(initialData.type || 'Movie'); // تنظیم مقدار اولیه type
      setImdbId(initialData.imdbId || '');
      console.log('Initial data loaded:', initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.append('cast', JSON.stringify(cast));
    formData.append('links', JSON.stringify(links));
    formData.append('options', JSON.stringify(options));
    formData.append('meta_tags', JSON.stringify(metaTags));
    formData.append('genres', JSON.stringify(selectedGenres));
    formData.append('type', type); // اضافه کردن type به formData

    console.log('Images before upload:', images);
    const uploadedImages = await Promise.all(
      images.map(async (img) => {
        const url = typeof img.file === 'string' ? img.file : await uploadImageToPublic(img.file as File);
        console.log('Uploaded URL:', url);
        return { label: img.label, url };
      })
    );
    console.log('Uploaded images:', uploadedImages);
    formData.append('images', JSON.stringify(uploadedImages));

    await onSubmit(formData);
  };

  const handleMovieSelect = (movieData: any) => {
    console.log('Selected movie:', movieData);
    setDirector(movieData.director || '');
    setTitle(movieData.title || '');
    setRelease(movieData.release || '');
    setDescription(movieData.description || '');
    setSelectedGenres(movieData.genres || []);
    setDuration(movieData.duration || '');
    setLanguage(movieData.language || '');
    setImdb(movieData.imdb || '');
    setType(movieData.type || 'Movie'); // تنظیم type از داده‌های انتخاب‌شده
    setImdbId(movieData.imdbId || '');
  };

  const handleAddCast = () => {
    setCast([...cast, { name: '', role: '' }]);
  };

  const handleCastChange = (index: number, field: 'name' | 'role', value: string) => {
    const newCast = [...cast];
    newCast[index][field] = value;
    setCast(newCast);
  };

  const removeCast = (index: number) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    setLinks([...links, { title: '', url: '', quality: '', size: '', encode: '', optionValues: {} }]);
  };

  const handleLinkChange = (index: number, field: string, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLinkOptionChange = (linkIndex: number, optionName: string, value: string) => {
    const newLinks = [...links];
    newLinks[linkIndex] = {
      ...newLinks[linkIndex],
      optionValues: {
        ...newLinks[linkIndex].optionValues,
        [optionName]: value,
      },
    };
    setLinks(newLinks);
  };

  const handleAddOption = () => {
    if (!newOptionName || !newOptionValues) return;
    const values = newOptionValues.split(',').map((v) => v.trim()).filter((v) => v);
    setOptions([...options, { name: newOptionName, values }]);
    setShowOptionDialog(false);
    setNewOptionName('');
    setNewOptionValues('');
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const addMetaTag = () => {
    setMetaTags([...metaTags, { key: '', value: '' }]);
  };

  const removeMetaTag = (index: number) => {
    setMetaTags(metaTags.filter((_, i) => i !== index));
  };

  const updateMetaTag = (index: number, field: 'key' | 'value', value: string) => {
    const newMetaTags = [...metaTags];
    newMetaTags[index][field] = value;
    setMetaTags(newMetaTags);
  };

  const handleImageUpload = async (file: File, label: string) => {
    if (images.length >= 4) return;
    try {
      await validateImageFile(file);
      setImages([...images, { file, label }]);
    } catch (error) {
      console.error('Image validation failed:', error);
    }
  };

  const handleGenreChange = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const renderLinkOptions = (link: MovieLink, linkIndex: number) => (
    <div className="space-y-2">
      <Label>Available for Options</Label>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <div key={option.name} className="w-[200px]">
            <Label>{option.name}</Label>
            <Select
              value={link.optionValues[option.name] || ''}
              onValueChange={(value) => handleLinkOptionChange(linkIndex, option.name, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${option.name}`} />
              </SelectTrigger>
              <SelectContent>
                {option.values.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="space-y-4">
        <MovieSearchPopup onSelectMovie={handleMovieSelect} />

        <div>
          <Label htmlFor="title">Movie Title*</Label>
          <Input
            id="title"
            name="title"
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="description">Description*</Label>
          <Textarea
            id="description"
            name="description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="release">Release Year*</Label>
          <Input
            id="release"
            name="release"
            type="number"
            min="1888"
            max={new Date().getFullYear()}
            required
            value={release}
            onChange={(e) => setRelease(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="type">Type*</Label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Movie">Movie</SelectItem>
              <SelectItem value="Series">Series</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="type" value={type} />
        </div>

        <div>
          <Label>Genres* (Select multiple)</Label>
          <div className="space-y-2">
            {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Crime', 'Mystery'].map((genre) => (
              <div key={genre} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`genre-${genre}`}
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleGenreChange(genre)}
                />
                <label htmlFor={`genre-${genre}`}>{genre}</label>
              </div>
            ))}
          </div>
          <input type="hidden" name="genres" value={JSON.stringify(selectedGenres)} />
        </div>

        <div>
          <Label htmlFor="director">Director</Label>
          <Input
            id="director"
            name="director"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="imdb">IMDB Rating</Label>
          <Input
            id="imdb"
            name="imdb"
            type="number"
            min="1"
            max="10"
            step="0.1"
            value={imdb}
            onChange={(e) => setImdb(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="imdbId">IMDB ID</Label>
          <Input
            id="imdbId"
            name="imdbId"
            type="text"
            value={imdbId}
            onChange={(e) => setImdbId(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="language">Language*</Label>
          <Input
            id="language"
            name="language"
            required
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Label>Cast ({cast.length})</Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddCast}>
              <Plus className="h-4 w-4 mr-2" />
              Add Cast Member
            </Button>
          </div>
          <div className="space-y-4">
            {cast.map((member, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => handleCastChange(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Role"
                  value={member.role}
                  onChange={(e) => handleCastChange(index, 'role', e.target.value)}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeCast(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Label>Download Links ({links.length}/10)</Label>
            {links.length < 10 && (
              <Button type="button" variant="outline" size="sm" onClick={handleAddLink}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {links.map((link, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Link Title"
                    value={link.title}
                    onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                  />
                  <Input
                    placeholder="URL"
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  />
                  <Input
                    placeholder="Quality (e.g., 1080p)"
                    value={link.quality}
                    onChange={(e) => handleLinkChange(index, 'quality', e.target.value)}
                  />
                  <Input
                    placeholder="Size (e.g., 1.5GB)"
                    value={link.size}
                    onChange={(e) => handleLinkChange(index, 'size', e.target.value)}
                  />
                  <Input
                    placeholder="Encode (e.g., x264)"
                    value={link.encode}
                    onChange={(e) => handleLinkChange(index, 'encode', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeLink(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {options.length > 0 && renderLinkOptions(link, index)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Label>Movie Options</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowOptionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{option.name}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value, vIndex) => (
                    <Badge key={vIndex} variant="secondary">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Label>Meta Tags</Label>
            <Button type="button" variant="outline" size="sm" onClick={addMetaTag}>
              <Plus className="h-4 w-4 mr-2" />
              Add Meta Tag
            </Button>
          </div>
          <div className="space-y-4">
            {metaTags.map((tag, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input
                  placeholder="Key (e.g., keywords)"
                  value={tag.key}
                  onChange={(e) => updateMetaTag(index, 'key', e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={tag.value}
                  onChange={(e) => updateMetaTag(index, 'value', e.target.value)}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeMetaTag(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ImageUpload
        images={images}
        onUpload={handleImageUpload}
        onRemove={(index) => setImages(images.filter((_, i) => i !== index))}
      />

      <Button type="submit" disabled={loading || selectedGenres.length === 0}>
        {loading ? 'Saving Movie...' : 'Save Movie'}
      </Button>

      <AlertDialog open={showOptionDialog} onOpenChange={setShowOptionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Movie Option</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div>
                  <Label>Option Name (e.g., Subtitle, Audio)</Label>
                  <Input
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    placeholder="Enter option name"
                  />
                </div>
                <div>
                  <Label>Option Values (comma-separated)</Label>
                  <Input
                    value={newOptionValues}
                    onChange={(e) => setNewOptionValues(e.target.value)}
                    placeholder="e.g., English, Persian"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddOption}>Add Option</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}