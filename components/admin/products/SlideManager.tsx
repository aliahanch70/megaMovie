'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, X, Edit, Save } from 'lucide-react';


export default function SlideManager() {
  const supabase = createClientComponentClient();
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    image_url: '',
    button_text: '',
    button_link: '',
  });
  const [newSlide, setNewSlide] = useState({
    title: '',
    description: '',
    image_url: '',
    button_text: '',
    button_link: '',
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  async function fetchSlides() {
    const { data, error } = await supabase
      .from('slides')
      .select('*')
      .order('order_number');
    if (data) setSlides(data);
    setLoading(false);
  }

  async function handleAddSlide(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase
      .from('slides')
      .insert([{ ...newSlide, order_number: slides.length }]);
    if (!error) {
      fetchSlides();
      setNewSlide({
        title: '',
        description: '',
        image_url: '',
        button_text: '',
        button_link: '',
      });
    }
  }

  async function handleDeleteSlide(id: string) {
    const { error } = await supabase.from('slides').delete().eq('id', id);
    if (!error) fetchSlides();
  }

  const startEditing = (slide: any) => {
    setEditingId(slide.id);
    setEditForm({
      title: slide.title,
      description: slide.description,
      image_url: slide.image_url,
      button_text: slide.button_text || '',
      button_link: slide.button_link || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      description: '',
      image_url: '',
      button_text: '',
      button_link: '',
    });
  };

  const handleUpdateSlide = async (id: string) => {
    const { error } = await supabase
      .from('slides')
      .update(editForm)
      .eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchSlides();
    } else {
      console.error('Error updating slide:', error);
    }
  };

  if (loading) return <Loader2 className="animate-spin" />;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Slide Manager</h2>
      
      <Card className="p-4 mb-8">
        <form onSubmit={handleAddSlide} className="space-y-4">
          <Input
            placeholder="Title"
            value={newSlide.title}
            onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={newSlide.description}
            onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
          />
          <Input
            placeholder="Image URL"
            value={newSlide.image_url}
            onChange={(e) => setNewSlide({ ...newSlide, image_url: e.target.value })}
          />
          <Input
            placeholder="Button Text (optional)"
            value={newSlide.button_text}
            onChange={(e) => setNewSlide({ ...newSlide, button_text: e.target.value })}
          />
          <Input
            placeholder="Button Link (optional)"
            value={newSlide.button_link}
            onChange={(e) => setNewSlide({ ...newSlide, button_link: e.target.value })}
          />
          <Button type="submit">Add Slide</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {slides.map((slide: any) => (
          <Card key={slide.id} className="p-4">
            {editingId === slide.id ? (
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
                <Input
                  placeholder="Image URL"
                  value={editForm.image_url}
                  onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                />
                <Input
                  placeholder="Button Text (optional)"
                  value={editForm.button_text}
                  onChange={(e) => setEditForm({ ...editForm, button_text: e.target.value })}
                />
                <Input
                  placeholder="Button Link (optional)"
                  value={editForm.button_link}
                  onChange={(e) => setEditForm({ ...editForm, button_link: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateSlide(slide.id)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={cancelEditing}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{slide.title}</h3>
                  <p className="text-sm text-gray-500">{slide.description}</p>
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="mt-2 h-32 object-cover rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => startEditing(slide)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteSlide(slide.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
