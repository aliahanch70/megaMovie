'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Upload } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface VideoUploadProps {
  movieId: string;
  movieTitle: string;
  onSuccess?: () => void;
}

export default function VideoUpload({ movieId, movieTitle, onSuccess }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoName, setVideoName] = useState('');
  const supabase = createClientComponentClient();

  const handleUpload = async () => {
    if (!videoFile || !videoName) return;

    try {
      setUploading(true);
      
      // Get the currently authenticated user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to upload videos');
      }

      // Create a unique filename
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Date.now()}_${movieId}.${fileExt}`;
      const filePath = `${movieId}/${fileName}`;

      // Upload video to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('movie-stories')
        .upload(filePath, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('movie-stories')
        .getPublicUrl(filePath);

      // Save video metadata to database
      const { error: dbError } = await supabase
        .from('movie_stories')
        .insert({
          movie_id: movieId,
          name: videoName,
          url: publicUrl,
          movie_title: movieTitle,
          user_id: session.user.id // Add user_id to track who uploaded
        });

      if (dbError) throw dbError;

      setVideoFile(null);
      setVideoName('');
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error uploading video:', error);
      alert(error.message || 'Error uploading video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="نام ویدیو"
        value={videoName}
        onChange={(e) => setVideoName(e.target.value)}
      />
      <Input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
      />
      <Button 
        onClick={handleUpload} 
        disabled={uploading || !videoFile || !videoName}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'در حال آپلود...' : 'آپلود ویدیو'}
      </Button>
    </div>
  );
}
