'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Link2, ChevronDown, ChevronUp, Loader2, ClipboardList } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { validateImageFile } from '@/lib/utils/validation';
import { uploadImageToPublic } from '@/lib/utils/uploadImage';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import MovieSearchPopup from '@/components/MovieSearchPopup';

interface MovieFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  initialData?: any;
}

interface CastMember { name: string; role: string; }

interface MovieLink {
  title: string; url: string; quality: string; size: string; encode: string;
  website?: string; optionValues: { [key: string]: string };
  season?: string; episode?: string; subtitle?: boolean; subtitleType?: string;
}

interface Option { name: string; values: string[]; }
interface MetaTag { key: string; value: string; }

function LinkCard({
  link, index, type, options, onChange, onRemove, onOptionChange, fetchingSize,
}: {
  link: MovieLink; index: number; type: string;
  options: Option[]; onChange: (i: number, f: string, v: string | boolean) => void;
  onRemove: (i: number) => void;
  onOptionChange: (li: number, name: string, v: string) => void;
  fetchingSize: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const label = link.episode
    ? `Ep ${parseInt(link.episode)} — S${link.season || '?'}`
    : link.title || `Link ${index + 1}`;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-neutral-900">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-sm truncate text-white">{label}</span>
          {link.quality && <Badge variant="secondary" className="text-xs shrink-0">{link.quality}</Badge>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(index); }} className="p-1 hover:text-red-400 text-gray-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-white/10">
          <Input
            placeholder="URL (paste to auto-detect)"
            value={link.url}
            onChange={(e) => onChange(index, 'url', e.target.value)}
            className="text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Title" value={link.title} onChange={(e) => onChange(index, 'title', e.target.value)} className="text-xs" />
            <Input placeholder="Website" value={link.website || ''} onChange={(e) => onChange(index, 'website', e.target.value)} className="text-xs" />
            <Input placeholder="Quality" value={link.quality} onChange={(e) => onChange(index, 'quality', e.target.value)} className="text-xs" />
            <div className="relative">
              <Input placeholder="Size" value={link.size} onChange={(e) => onChange(index, 'size', e.target.value)} className="text-xs pr-7" />
              {fetchingSize && <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />}
            </div>
            <Input placeholder="Encode" value={link.encode} onChange={(e) => onChange(index, 'encode', e.target.value)} className="text-xs col-span-2" />
          </div>

          {type === 'Series' && (
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Season" value={link.season || ''} onChange={(e) => onChange(index, 'season', e.target.value)} className="text-xs" />
              <Input placeholder="Episode" value={link.episode || ''} onChange={(e) => onChange(index, 'episode', e.target.value)} className="text-xs" />
              <div className="col-span-2 flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" checked={!!link.subtitle} onChange={(e) => onChange(index, 'subtitle', e.target.checked)} />
                  Subtitle
                </label>
                {link.subtitle && (
                  <Select value={link.subtitleType || ''} onValueChange={(v) => onChange(index, 'subtitleType', v)}>
                    <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soft">Soft Sub</SelectItem>
                      <SelectItem value="Hard">Hard Sub</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}

          {options.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => (
                <Select key={opt.name} value={link.optionValues[opt.name] || ''} onValueChange={(v) => onOptionChange(index, opt.name, v)}>
                  <SelectTrigger className="h-7 text-xs w-32"><SelectValue placeholder={opt.name} /></SelectTrigger>
                  <SelectContent>{opt.values.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SeasonGroup({ label, indices, links, type, options, fetchingSizeIndex, onChange, onRemove, onOptionChange }: {
  label: string; indices: number[]; links: MovieLink[]; type: string; options: Option[];
  fetchingSizeIndex: number | null;
  onChange: (i: number, f: string, v: string | boolean) => void;
  onRemove: (i: number) => void;
  onOptionChange: (li: number, name: string, v: string) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 transition-colors text-left">
        <span className="text-xs font-semibold text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{indices.length} links</span>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
        </div>
      </button>
      {open && (
        <div className="p-2 space-y-1.5">
          {indices.map((i) => (
            <LinkCard key={i} link={links[i]} index={i} type={type} options={options}
              onChange={onChange} onRemove={onRemove} onOptionChange={onOptionChange}
              fetchingSize={fetchingSizeIndex === i} />
          ))}
        </div>
      )}
    </div>
  );
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
  const [fetchingSizeIndex, setFetchingSizeIndex] = useState<number | null>(null);
  const [dupLinkWarning, setDupLinkWarning] = useState<{ msg: string; pendingIndex: number | null } | null>(null);
  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [bulkDupWarning, setBulkDupWarning] = useState<{ newOnes: MovieLink[]; dupes: MovieLink[] } | null>(null);
  const [dupMovieWarning, setDupMovieWarning] = useState<{ msg: string; existingId: string } | null>(null);
  const [pendingSubmitData, setPendingSubmitData] = useState<FormData | null>(null);

  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialData?.genres || []);
  const [imdb, setImdb] = useState(initialData?.imdb || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [release, setRelease] = useState(initialData?.release || '');
  const [director, setDirector] = useState(initialData?.director || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [language, setLanguage] = useState(initialData?.language || '');
  const [type, setType] = useState<string>(initialData?.type || 'Movie');
  const [imdbId, setImdbId] = useState(initialData?.imdbId || '');

  const linksEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setImages(initialData.movie_images?.map((img: any) => ({ file: img.url, label: img.label || '' })) || []);
      setLinks(initialData.movie_links?.map((link: any) => ({ ...link, optionValues: link.option_values || {}, subtitleType: link.subtitle_type || link.subtitleType || '' })) || []);
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
      setType(initialData.type || 'Movie');
      setImdbId(initialData.imdbId || '');
    }
  }, [initialData]);

  const buildFormData = async (form: HTMLFormElement): Promise<FormData> => {
    const formData = new FormData(form);
    formData.append('cast', JSON.stringify(cast));
    formData.append('links', JSON.stringify(links));
    formData.append('options', JSON.stringify(options));
    formData.append('meta_tags', JSON.stringify(metaTags));
    formData.append('genres', JSON.stringify(selectedGenres));
    formData.append('type', type);
    const uploadedImages = await Promise.all(
      images.map(async (img) => {
        const url = typeof img.file === 'string' ? img.file : await uploadImageToPublic(img.file as File);
        return { label: img.label, url };
      })
    );
    formData.append('images', JSON.stringify(uploadedImages));
    return formData;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !release) return;

    // چک تکراری بودن فیلم — فقط برای create (بدون initialData)
    if (!initialData) {
      const supabase = createClient();
      const { data } = await supabase
        .from('movies')
        .select('id, title, release')
        .ilike('title', title.trim())
        .eq('release', parseInt(release))
        .maybeSingle();

      if (data) {
        const fd = await buildFormData(e.currentTarget);
        setPendingSubmitData(fd);
        setDupMovieWarning({ msg: `"${data.title} (${data.release})" already exists in the database.`, existingId: data.id });
        return;
      }
    }

    const formData = await buildFormData(e.currentTarget);
    await onSubmit(formData);
  };

  const handleMovieSelect = (movieData: any) => {
    setTitle(movieData.title || '');
    setRelease(movieData.release || '');
    setDescription(movieData.description || '');
    setSelectedGenres(movieData.genres || []);
    setDuration(movieData.duration || '');
    setLanguage(movieData.language || '');
    setImdb(movieData.imdb || '');
    setImdbId(movieData.imdbId || '');
    setType(movieData.type || 'Movie');
    setDirector(movieData.director || '');
    if (movieData.actors) {
      setCast(movieData.actors.split(', ').map((name: string) => ({ name, role: 'Actor' })));
    }
    if (movieData.image) setImages([{ file: movieData.image, label: 'Poster' }]);
  };

  const parseLink = (url: string): Partial<MovieLink> => {
    const result: Partial<MovieLink> = {};
    const qualityMatch = url.match(/\b(2160p|1080p|720p|480p|4K)\b/i);
    if (qualityMatch) result.quality = qualityMatch[1].toUpperCase().replace('P', 'p');
    const encodeMatch = url.match(/\b(x265|x264|10bit|8bit|HEVC|AVC|WEB-DL|BluRay|HDTV)\b/gi);
    if (encodeMatch) result.encode = encodeMatch.join('.');
    if (/softsub/i.test(url)) { result.subtitle = true; result.subtitleType = 'Soft'; }
    else if (/hardsub/i.test(url)) { result.subtitle = true; result.subtitleType = 'Hard'; }
    else if (/\.sub\b/i.test(url)) { result.subtitle = true; result.subtitleType = 'Soft'; }
    else result.subtitle = false;
    const seMatch = url.match(/[Ss](\d{1,2})[Ee](\d{1,3})/);
    if (seMatch) { result.season = seMatch[1]; result.episode = seMatch[2]; result.title = `Episode ${parseInt(seMatch[2])}`; }
    else { const sMatch = url.match(/\/S(\d{2})\//i); if (sMatch) result.season = sMatch[1]; result.title = title; }
    const domainMatch = url.match(/https?:\/\/[^/]*\.([^./]+)\.[^./]+\//i);
    if (domainMatch) result.website = domainMatch[1];
    return result;
  };

  const fetchFileSize = async (url: string, index: number) => {
    setFetchingSizeIndex(index);
    try {
      const res = await fetch(`/api/file-size?url=${encodeURIComponent(url)}`);
      const { size } = await res.json();
      if (size) {
        setLinks((prev) => {
          const u = [...prev];
          u[index] = { ...u[index], size };
          // چک تکراری بودن بعد از پر شدن حجم
          const dup = checkDuplicateLink(u[index], index);
          if (dup) setDupLinkWarning({ msg: dup, pendingIndex: index });
          return u;
        });
      }
    } catch {} finally { setFetchingSizeIndex(null); }
  };

  const checkDuplicateLink = (newLink: Partial<MovieLink>, excludeIndex: number): string | null => {
    for (let i = 0; i < links.length; i++) {
      if (i === excludeIndex) continue;
      const l = links[i];
      const sameEpisode = type === 'Series'
        ? l.season === (newLink.season || '') && l.episode === (newLink.episode || '')
        : true;
      const sameQuality = l.quality === (newLink.quality || '');
      const sameSize = newLink.size ? l.size === newLink.size : false;
      if (sameEpisode && sameQuality && sameSize && newLink.size) {
        return type === 'Series'
          ? `S${l.season}E${l.episode} with quality "${l.quality}" and size "${l.size}" already exists.`
          : `A link with quality "${l.quality}" and size "${l.size}" already exists.`;
      }
    }
    return null;
  };

  const handleAddLink = () => {
    setLinks((prev) => [...prev, { title: '', url: '', quality: '', size: '', encode: '', website: '', optionValues: {}, season: '', episode: '', subtitle: false, subtitleType: '' }]);
    setTimeout(() => linksEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const parseBulkLinks = (text: string): MovieLink[] => {
    return text.split(/\s+/).map((u) => u.trim()).filter((u) => u.startsWith('http')).map((u) => ({
      url: u, optionValues: {}, size: '', ...parseLink(u),
      quality: parseLink(u).quality || '',
      encode: parseLink(u).encode || '',
      title: parseLink(u).title || '',
    } as MovieLink));
  };

  const handleBulkAdd = (addAll: boolean) => {
    const parsed = parseBulkLinks(bulkText);
    const toAdd = addAll ? parsed : (bulkDupWarning?.newOnes || []);
    setLinks((prev) => [...prev, ...toAdd]);
    setBulkText('');
    setShowBulk(false);
    setBulkDupWarning(null);
  };

  const handleBulkSubmit = () => {
    const parsed = parseBulkLinks(bulkText);
    if (!parsed.length) return;
    const dupes: MovieLink[] = [];
    const newOnes: MovieLink[] = [];
    for (const p of parsed) {
      const isDup = links.some((l) => {
        const sameEp = type === 'Series' ? l.season === p.season && l.episode === p.episode : true;
        return sameEp && l.quality === p.quality;
      });
      isDup ? dupes.push(p) : newOnes.push(p);
    }
    if (dupes.length > 0) {
      setBulkDupWarning({ newOnes, dupes });
    } else {
      setLinks((prev) => [...prev, ...parsed]);
      setBulkText('');
      setShowBulk(false);
    }
  };

  const handleLinkChange = (index: number, field: string, value: string | boolean) => {
    const newLinks = [...links];
    let updatedLink: MovieLink;
    if (field === 'url' && typeof value === 'string') {
      const parsed = parseLink(value);
      updatedLink = { ...newLinks[index], url: value, ...parsed };
      newLinks[index] = updatedLink;
      setLinks(newLinks);
      if (value.startsWith('http')) fetchFileSize(value, index);
    } else {
      updatedLink = { ...newLinks[index], [field]: value };
      newLinks[index] = updatedLink;
      setLinks(newLinks);
    }

    // چک تکراری بودن لینک بعد از fetch حجم یا تغییر کیفیت/قسمت
    if (['size', 'quality', 'season', 'episode'].includes(field)) {
      const dup = checkDuplicateLink(updatedLink, index);
      if (dup) setDupLinkWarning({ msg: dup, pendingIndex: index });
    }
  };

  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));
  const handleLinkOptionChange = (li: number, name: string, v: string) => {
    const n = [...links]; n[li] = { ...n[li], optionValues: { ...n[li].optionValues, [name]: v } }; setLinks(n);
  };
  const handleAddCast = () => setCast([...cast, { name: '', role: '' }]);
  const handleCastChange = (i: number, f: 'name' | 'role', v: string) => { const n = [...cast]; n[i][f] = v; setCast(n); };
  const removeCast = (i: number) => setCast(cast.filter((_, j) => j !== i));
  const handleAddOption = () => {
    if (!newOptionName || !newOptionValues) return;
    setOptions([...options, { name: newOptionName, values: newOptionValues.split(',').map((v) => v.trim()).filter(Boolean) }]);
    setShowOptionDialog(false); setNewOptionName(''); setNewOptionValues('');
  };
  const removeOption = (i: number) => setOptions(options.filter((_, j) => j !== i));
  const addMetaTag = () => setMetaTags([...metaTags, { key: '', value: '' }]);
  const removeMetaTag = (i: number) => setMetaTags(metaTags.filter((_, j) => j !== i));
  const updateMetaTag = (i: number, f: 'key' | 'value', v: string) => { const n = [...metaTags]; n[i][f] = v; setMetaTags(n); };
  const handleImageUpload = async (file: File, label: string) => {
    if (images.length >= 4) return;
    try { await validateImageFile(file); setImages([...images, { file, label }]); } catch (e) { console.error(e); }
  };
  const handleGenreChange = (g: string) => setSelectedGenres(selectedGenres.includes(g) ? selectedGenres.filter((x) => x !== g) : [...selectedGenres, g]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Sticky Save Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-neutral-950/90 backdrop-blur border-b border-white/10">
        <span className="text-sm text-gray-400">{title || 'New Movie'}</span>
        <Button type="submit" disabled={loading || selectedGenres.length === 0} size="sm">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-screen">
        {/* ── Left: Movie Info ── */}
        <div className="space-y-4 p-6 border-r border-white/10 overflow-y-auto">
          <MovieSearchPopup onSelectMovie={handleMovieSelect} />

          <Card className="bg-neutral-900 border-white/10">
            <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Basic Info</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div><Label className="text-xs">Title*</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} /></div>
              <div><Label className="text-xs">Description*</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Release Year*</Label><Input type="number" min="1888" max={new Date().getFullYear()} value={release} onChange={(e) => setRelease(e.target.value)} required /></div>
                <div>
                  <Label className="text-xs">Type*</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Movie">Movie</SelectItem><SelectItem value="Series">Series</SelectItem></SelectContent>
                  </Select>
                  <input type="hidden" name="type" value={type} />
                </div>
                <div><Label className="text-xs">Director</Label><Input value={director} onChange={(e) => setDirector(e.target.value)} /></div>
                <div><Label className="text-xs">Language*</Label><Input value={language} onChange={(e) => setLanguage(e.target.value)} required /></div>
                <div><Label className="text-xs">IMDB Rating</Label><Input type="number" min="1" max="10" step="0.1" value={imdb} onChange={(e) => setImdb(e.target.value)} /></div>
                <div><Label className="text-xs">IMDB ID</Label><Input value={imdbId} onChange={(e) => setImdbId(e.target.value)} /></div>
                <div><Label className="text-xs">Duration (min)</Label><Input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
              </div>
              <input type="hidden" name="title" value={title} />
              <input type="hidden" name="description" value={description} />
              <input type="hidden" name="release" value={release} />
              <input type="hidden" name="director" value={director} />
              <input type="hidden" name="language" value={language} />
              <input type="hidden" name="imdb" value={imdb} />
              <input type="hidden" name="imdbId" value={imdbId} />
              <input type="hidden" name="duration" value={duration} />
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-white/10">
            <CardHeader className="pb-2 pt-4 px-4"><CardTitle className="text-sm">Genres*</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Crime', 'Mystery', 'Adventure', 'Fantasy'].map((g) => (
                  <button key={g} type="button" onClick={() => handleGenreChange(g)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedGenres.includes(g) ? 'bg-white text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}>
                    {g}
                  </button>
                ))}
              </div>
              <input type="hidden" name="genres" value={JSON.stringify(selectedGenres)} />
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-white/10">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Cast ({cast.length})</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddCast}><Plus className="w-3.5 h-3.5 mr-1" />Add</Button>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {cast.map((m, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Name" value={m.name} onChange={(e) => handleCastChange(i, 'name', e.target.value)} className="text-xs" />
                  <Input placeholder="Role" value={m.role} onChange={(e) => handleCastChange(i, 'role', e.target.value)} className="text-xs" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeCast(i)}><X className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-white/10">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Meta Tags</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addMetaTag}><Plus className="w-3.5 h-3.5 mr-1" />Add</Button>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {metaTags.map((tag, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Key" value={tag.key} onChange={(e) => updateMetaTag(i, 'key', e.target.value)} className="text-xs" />
                  <Input placeholder="Value" value={tag.value} onChange={(e) => updateMetaTag(i, 'value', e.target.value)} className="text-xs" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeMetaTag(i)}><X className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <ImageUpload images={images} onUpload={handleImageUpload} onRemove={(i) => setImages(images.filter((_, j) => j !== i))} />
        </div>

        {/* ── Right: Links (sticky panel) ── */}
        <div className="flex flex-col lg:sticky lg:top-[49px] lg:h-[calc(100vh-49px)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <span className="text-sm font-medium">Download Links <span className="text-gray-400">({links.length})</span></span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowOptionDialog(true)}><Plus className="w-3.5 h-3.5 mr-1" />Option</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowBulk((v) => !v)}><ClipboardList className="w-3.5 h-3.5 mr-1" />Bulk</Button>
              <Button type="button" size="sm" onClick={handleAddLink}><Plus className="w-3.5 h-3.5 mr-1" />Add Link</Button>
            </div>
          </div>

          {/* Bulk paste area */}
          {showBulk && (
            <div className="px-4 py-3 border-b border-white/10 space-y-2 shrink-0 bg-neutral-950">
              <Label className="text-xs text-gray-400">Paste URLs (one per line or space-separated)</Label>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`https://dl.example.com/S01E01.1080p.mkv\nhttps://dl.example.com/S01E02.1080p.mkv`}
                rows={4}
                className="text-xs font-mono"
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowBulk(false); setBulkText(''); }}>Cancel</Button>
                <Button type="button" size="sm" onClick={handleBulkSubmit} disabled={!bulkText.trim()}>Add {parseBulkLinks(bulkText).length} Links</Button>
              </div>
            </div>
          )}

          {/* Options badges */}
          {options.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-white/10 shrink-0">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-xs">
                  <span>{opt.name}: {opt.values.join(', ')}</span>
                  <button type="button" onClick={() => removeOption(i)}><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}

          {/* Scrollable links list — grouped by season */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {links.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm gap-2">
                <Link2 className="w-8 h-8 opacity-30" />
                No links yet.
              </div>
            )}
            {(() => {
              if (type !== 'Series') return links.map((link, i) => (
                <LinkCard key={i} link={link} index={i} type={type} options={options}
                  onChange={handleLinkChange} onRemove={removeLink}
                  onOptionChange={handleLinkOptionChange} fetchingSize={fetchingSizeIndex === i} />
              ));
              // گروهبندی فصل به فصل
              const seasonMap: Record<string, number[]> = {};
              links.forEach((l, i) => {
                const s = l.season ? `Season ${parseInt(l.season)}` : 'Other';
                if (!seasonMap[s]) seasonMap[s] = [];
                seasonMap[s].push(i);
              });
              return Object.keys(seasonMap).sort((a, b) => {
                const na = parseInt(a.replace(/\D/g, '')) || 99;
                const nb = parseInt(b.replace(/\D/g, '')) || 99;
                return na - nb;
              }).map((season) => (
                <SeasonGroup key={season} label={season} indices={seasonMap[season]} links={links}
                  type={type} options={options} fetchingSizeIndex={fetchingSizeIndex}
                  onChange={handleLinkChange} onRemove={removeLink} onOptionChange={handleLinkOptionChange} />
              ));
            })()}
            <div ref={linksEndRef} />
          </div>
        </div>
      </div>

      <AlertDialog open={showOptionDialog} onOpenChange={setShowOptionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Movie Option</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 pt-2">
                <div><Label>Option Name</Label><Input value={newOptionName} onChange={(e) => setNewOptionName(e.target.value)} placeholder="e.g. Subtitle" /></div>
                <div><Label>Values (comma-separated)</Label><Input value={newOptionValues} onChange={(e) => setNewOptionValues(e.target.value)} placeholder="e.g. English, Persian" /></div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddOption}>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Duplicate Warning */}
      <AlertDialog open={!!bulkDupWarning} onOpenChange={(o) => { if (!o) setBulkDupWarning(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Duplicate Episodes Detected</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkDupWarning?.dupes.length} episode(s) already exist:
              <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                {bulkDupWarning?.dupes.map((d, i) => (
                  <div key={i} className="text-xs font-mono bg-white/5 px-2 py-1 rounded">
                    {d.season && d.episode ? `S${d.season}E${d.episode}` : d.title} — {d.quality}
                  </div>
                ))}
              </div>
              <div className="mt-3">{bulkDupWarning?.newOnes.length} new episode(s) will be added.</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkDupWarning(null)}>Cancel</AlertDialogCancel>
            <Button variant="outline" size="sm" onClick={() => handleBulkAdd(false)} className="mr-2">Add New Only ({bulkDupWarning?.newOnes.length})</Button>
            <AlertDialogAction onClick={() => handleBulkAdd(true)}>Add All ({(bulkDupWarning?.newOnes.length || 0) + (bulkDupWarning?.dupes.length || 0)})</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={!!dupLinkWarning} onOpenChange={(o) => { if (!o) setDupLinkWarning(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Duplicate Link Detected</AlertDialogTitle>
            <AlertDialogDescription>{dupLinkWarning?.msg}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              if (dupLinkWarning?.pendingIndex != null) removeLink(dupLinkWarning.pendingIndex);
              setDupLinkWarning(null);
            }}>Remove Duplicate</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDupLinkWarning(null)}>Keep Anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Movie Warning */}
      <AlertDialog open={!!dupMovieWarning} onOpenChange={(o) => { if (!o) setDupMovieWarning(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Movie Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              {dupMovieWarning?.msg}
              <br /><br />
              Do you want to save it anyway as a new entry?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDupMovieWarning(null); setPendingSubmitData(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (pendingSubmitData) await onSubmit(pendingSubmitData);
              setDupMovieWarning(null); setPendingSubmitData(null);
            }}>Save Anyway</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
