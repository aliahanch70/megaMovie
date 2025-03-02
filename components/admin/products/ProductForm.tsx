'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, PlusCircle, Trash2 } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { validateImageFile } from '@/lib/utils/validation';
import { uploadImageToPublic } from '@/lib/utils/uploadImage';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface ProductLink {
  title: string;
  url: string;
  price: number;
  city: string;
  warranty: string;
  optionValues: { [key: string]: string };
}

interface ProductFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  initialData?: any;
}

interface Option {
  name: string;
  values: string[];
}

export default function ProductForm({ onSubmit, loading, initialData }: ProductFormProps) {
  const [links, setLinks] = useState<ProductLink[]>([]);
  const [images, setImages] = useState<Array<{ file: File | string; label: string }>>([]);
  const [specifications, setSpecifications] = useState<Array<{ category: string; label: string; value: string }>>(initialData?.product_specifications || []);
  const [options, setOptions] = useState<Option[]>(initialData?.product_options || []);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showOptionDialog, setShowOptionDialog] = useState(false);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState('');
  const [metaTags, setMetaTags] = useState<Array<{key: string, value: string}>>(
    initialData?.meta_tags || [{ key: '', value: '' }]
  );

  useEffect(() => {
    if (initialData) {
      // Initialize images with the correct format
      const initialImages = initialData.product_images?.map((img: any) => ({
        file: img.url, // Use the full URL
        label: img.label || ''
      })) || [];
      
      setImages(initialImages);
      
      // Initialize other data
      const initialLinks = initialData.product_links?.map((link: any) => ({
        title: link.title,
        url: link.url,
        price: link.price,
        city: link.city || '',
        warranty: link.warranty || '',
        optionValues: link.option_values || {}
      })) || [];
      
      setLinks(initialLinks);

      console.log('Initializing form with images:', initialImages);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    formData.append('links', JSON.stringify(links));
    formData.append('specifications', JSON.stringify(specifications));
    formData.append('options', JSON.stringify(options));
    formData.set('meta_tags', JSON.stringify(metaTags));

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

  const handleAddLink = () => {
    setLinks([...links, { 
      title: '', 
      url: '', 
      price: 0, 
      city: '', 
      warranty: '',
      optionValues: {} // Initialize with empty object
    }]);
  };

  const handleLinkChange = (index: number, field: string, value: string | number) => {
    const newLinks = [...links];
    if (field === 'price') {
      // Ensure price is always a valid number
      const numberValue = parseFloat(value as string) || 0;
      newLinks[index] = { ...newLinks[index], [field]: numberValue };
    } else {
      newLinks[index] = { ...newLinks[index], [field]: value };
    }
    setLinks(newLinks);
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

  const addSpecification = () => {
    setSpecifications([...specifications, { category: '', label: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (index: number, field: string, value: string) => {
    const updated = specifications.map((spec, i) => {
      if (i === index) {
        return { ...spec, [field]: value };
      }
      return spec;
    });
    setSpecifications(updated);
  };

  const handleSpecificationAdd = () => {
    setSpecifications([...specifications, { category: '', label: '', value: '' }]);
  };

  const handleSpecificationRemove = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSpecificationChange = (index: number, field: string, value: string) => {
    const updatedSpecs = [...specifications];
    updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
    setSpecifications(updatedSpecs);
  };

  const handleAddOption = () => {
    if (!newOptionName || !newOptionValues) return;
    
    const values = newOptionValues.split(',').map(v => v.trim()).filter(v => v);
    setOptions([...options, { name: newOptionName, values }]);
    setShowOptionDialog(false);
    setNewOptionName('');
    setNewOptionValues('');
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

  const handleLinkOptionChange = (linkIndex: number, optionName: string, value: string) => {
    const newLinks = [...links];
    newLinks[linkIndex] = {
      ...newLinks[linkIndex],
      optionValues: {
        ...newLinks[linkIndex].optionValues,
        [optionName]: value
      }
    };
    setLinks(newLinks);
  };

  const renderLinkOptions = (link: ProductLink, linkIndex: number) => (
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

      {/* Options Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Label>Product Options</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setShowOptionDialog(true)}
            >
              Add Option
            </Button>
          </div>

          <div className="space-y-4">
            {options.map((option, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{option.name}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOptions(options.filter((_, i) => i !== index));
                    }}
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
          <Label>External Links ({links.length}/10)</Label>
          <div className="space-y-4 mt-2">
            {links.map((link, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-lg">
                <div className="flex gap-2">
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
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    min="0"
                    value={link.price}
                    onChange={(e) => handleLinkChange(index, 'price', e.target.value)}
                    required
                  />
                  <Input
                    placeholder="City"
                    value={link.city}
                    onChange={(e) => handleLinkChange(index, 'city', e.target.value)}
                  />
                  <Input
                    placeholder="Warranty"
                    value={link.warranty}
                    onChange={(e) => handleLinkChange(index, 'warranty', e.target.value)}
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
                
                {/* Option selection for link */}
                {options.length > 0 && renderLinkOptions(link, index)}
              </div>
            ))}
            {links.length < 10 && (
              <Button type="button" onClick={handleAddLink} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Specifications</h3>
          <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Specification
          </Button>
        </div>

        {specifications.map((spec, index) => (
          <div key={index} className="flex gap-4 items-start border p-4 rounded-lg">
            <Select
              value={spec.category}
              onValueChange={(value) => updateSpecification(index, 'category', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Label"
              value={spec.label}
              onChange={(e) => updateSpecification(index, 'label', e.target.value)}
              className="flex-1"
            />
            
            <Input
              placeholder="Value"
              value={spec.value}
              onChange={(e) => updateSpecification(index, 'value', e.target.value)}
              className="flex-1"
            />
            
            <Button 
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSpecification(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Specifications</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleSpecificationAdd}
          >
            Add Specification
          </Button>
        </div>
        
        {specifications.map((spec, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="grid gap-2 flex-1">
              <Input
                placeholder="Category"
                value={spec.category}
                onChange={(e) => handleSpecificationChange(index, 'category', e.target.value)}
              />
              <Input
                placeholder="Label"
                value={spec.label}
                onChange={(e) => handleSpecificationChange(index, 'label', e.target.value)}
              />
              <Input
                placeholder="Value"
                value={spec.value}
                onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleSpecificationRemove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4 p-6">
        <h3 className="font-semibold">Meta Tags</h3>
        {metaTags.map((tag, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              placeholder="Key (e.g., description)"
              value={tag.key}
              onChange={(e) => updateMetaTag(index, 'key', e.target.value)}
              className="flex-1 input"
            />
            <input
              type="text"
              placeholder="Value"
              value={tag.value}
              onChange={(e) => updateMetaTag(index, 'value', e.target.value)}
              className="flex-1 input"
            />
            <button
              type="button"
              onClick={() => removeMetaTag(index)}
              className="btn-danger"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMetaTag}
          className="btn-secondary"
        >
          Add Meta Tag
        </button>
      </div>

      <ImageUpload
        images={images}
        onUpload={handleImageUpload}
        onRemove={(index) => setImages(images.filter((_, i) => i !== index))} 
      />

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving Changes...' : 'Save Changes'}
      </Button>

      {/* Option Dialog */}
      <AlertDialog open={showOptionDialog} onOpenChange={setShowOptionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Product Option</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div>
                  <Label>Option Name (e.g., Size, Color)</Label>
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
                    placeholder="e.g., Small, Medium, Large"
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