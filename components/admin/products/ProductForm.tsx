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

interface ProductFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  initialData?: any;
}

export default function ProductForm({ onSubmit, loading, initialData }: ProductFormProps) {
  const [links, setLinks] = useState<Array<{ title: string; url: string }>>([]);
  const [images, setImages] = useState<Array<{ file: File | string; label: string }>>([]);

  useEffect(() => {
    if (initialData) {
      setLinks(initialData.product_links || []);
      setImages(
        initialData.product_images?.map((img: any) => ({
          file: img.url,
          label: img.label
        })) || []
      );
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    formData.append('links', JSON.stringify(links));

    // Handle image uploads
    const uploadedImages = await Promise.all(
      images.map(async (img) => ({
        label: img.label,
        url: typeof img.file === 'string' 
          ? img.file 
          : await uploadImageToPublic(img.file as File)
      }))
    );
    formData.append('images', JSON.stringify(uploadedImages));

    await onSubmit(formData);
  };

  const addLink = () => {
    if (links.length < 10) {
      setLinks([...links, { title: '', url: '' }]);
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name*</Label>
          <Input 
            id="name" 
            name="name" 
            required 
            maxLength={100}
            defaultValue={initialData?.name}
          />
        </div>

        <div>
          <Label htmlFor="description">Description*</Label>
          <Textarea 
            id="description" 
            name="description" 
            required
            defaultValue={initialData?.description}
          />
        </div>

        <div>
          <Label htmlFor="price">Price*</Label>
          <Input 
            id="price" 
            name="price" 
            type="number" 
            step="0.01" 
            required
            defaultValue={initialData?.price}
          />
        </div>

        <div>
          <Label htmlFor="category">Category*</Label>
          <Select name="category" required defaultValue={initialData?.category}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="books">Books</SelectItem>
              <SelectItem value="home">Home & Garden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status*</Label>
          <Select name="status" required defaultValue={initialData?.status}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Label>External Links ({links.length}/10)</Label>
          <div className="space-y-4 mt-2">
            {links.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Link Title"
                  value={link.title}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index].title = e.target.value;
                    setLinks(newLinks);
                  }}
                />
                <Input
                  placeholder="URL"
                  type="url"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index].url = e.target.value;
                    setLinks(newLinks);
                  }}
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
            ))}
            {links.length < 10 && (
              <Button type="button" onClick={addLink} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ImageUpload
        images={images}
        onUpload={handleImageUpload}
        onRemove={(index) => setImages(images.filter((_, i) => i !== index))}
      />

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving Changes...' : 'Save Changes'}
      </Button>
    </form>
  );
}