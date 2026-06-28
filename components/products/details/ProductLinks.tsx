"use client";

import { useState } from "react";
import { Copy, Check, Download, ChevronDown, ChevronUp } from "lucide-react";

interface LinkItem {
  title: string;
  url: string;
  quality?: string;
  size?: string;
  encode?: string;
  website?: string;
  season?: string;
  episode?: string;
  subtitle?: boolean;
  subtitleType?: string;
  subtitle_type?: string;
  option_values?: Record<string, string>;
}

interface ProductLinksProps {
  links: LinkItem[];
  type?: string | null;
}

function uniqueSorted(arr: string[]): string[] {
  const seen: Record<string, boolean> = {};
  const result: string[] = [];
  for (const item of arr) {
    if (!seen[item]) { seen[item] = true; result.push(item); }
  }
  return result.sort();
}

function getQualityLabel(link: LinkItem): string {
  return [link.quality, link.encode].filter(Boolean).join(" ") || "Unknown";
}

function CopyButton({ links }: { links: LinkItem[] }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(links.map((l) => l.url).join("\n")).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-sm text-white transition-colors"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied!" : "Copy all links"}
    </button>
  );
}

function QualityBlock({ qualityLabel, links }: { qualityLabel: string; links: LinkItem[] }) {
  const [open, setOpen] = useState(false);
  const subType = links[0]?.subtitleType || links[0]?.subtitle_type;
  const hasSub = links[0]?.subtitle;
  const size = links[0]?.size;
  const episodeCount = links.length;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Quality Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-white"
        >
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {hasSub && subType && (
            <span className="px-3 py-0.5 rounded-full bg-blue-500 text-white text-xs font-medium">
              {subType === "Soft" ? "Softsub" : subType === "Hard" ? "Hardsub" : subType}
            </span>
          )}
          <span className="text-white font-bold text-sm">{qualityLabel}</span>
          <span className="text-gray-400 text-xs">:کیفیت</span>
        </div>
      </div>

      {open && (
        <>
          {/* Info Bar */}
          <div className="flex items-center justify-end gap-6 px-4 py-2 border-b border-white/10 text-xs text-gray-400">
            {size && (
              <div className="flex items-center gap-1.5">
                <span>{size}</span>
                <span>:حجم</span>
                <Download className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span>{episodeCount}</span>
              <span>:تعداد قسمت</span>
              <Copy className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Episode Buttons Grid */}
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {links
                .sort((a, b) => (parseInt(a.episode || "0") || 0) - (parseInt(b.episode || "0") || 0))
                .map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-3 py-2 rounded-lg border border-white/20 bg-transparent hover:bg-white/10 text-white text-sm transition-colors text-center"
                  >
                    {link.episode ? `Episode ${parseInt(link.episode)}` : link.title || `Link ${i + 1}`}
                  </a>
                ))}
            </div>
            <div className="flex justify-end">
              <CopyButton links={links} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SeasonBlock({ seasonLabel, links }: { seasonLabel: string; links: LinkItem[] }) {
  const [open, setOpen] = useState(true);

  const qualityGroups = links.reduce((acc, link) => {
    const q = getQualityLabel(link);
    if (!acc[q]) acc[q] = [];
    acc[q].push(link);
    return acc;
  }, {} as Record<string, LinkItem[]>);

  const qualityKeys = uniqueSorted(Object.keys(qualityGroups));

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900 overflow-hidden">
      {/* Season Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 px-3 py-1 rounded-full border border-white/10">
            {links.length} links
          </span>
          <span className="text-white font-bold">{seasonLabel}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {qualityKeys.map((q) => (
            <QualityBlock key={q} qualityLabel={q} links={qualityGroups[q]} />
          ))}
        </div>
      )}
    </div>
  );
}

function SeriesLinks({ links }: { links: LinkItem[] }) {
  const seasons = links.reduce((acc, link) => {
    const s = link.season ? `Season ${parseInt(link.season)}` : "Other";
    if (!acc[s]) acc[s] = [];
    acc[s].push(link);
    return acc;
  }, {} as Record<string, LinkItem[]>);

  const seasonKeys = Object.keys(seasons).sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, "")) || 99;
    const nb = parseInt(b.replace(/\D/g, "")) || 99;
    return na - nb;
  });

  return (
    <div className="space-y-3">
      {seasonKeys.map((s) => (
        <SeasonBlock key={s} seasonLabel={s} links={seasons[s]} />
      ))}
    </div>
  );
}

function MovieLinks({ links }: { links: LinkItem[] }) {
  const qualityGroups = links.reduce((acc, link) => {
    const q = getQualityLabel(link);
    if (!acc[q]) acc[q] = [];
    acc[q].push(link);
    return acc;
  }, {} as Record<string, LinkItem[]>);

  const qualityKeys = uniqueSorted(Object.keys(qualityGroups));

  return (
    <div className="space-y-3">
      {qualityKeys.map((q) => (
        <QualityBlock key={q} qualityLabel={q} links={qualityGroups[q]} />
      ))}
    </div>
  );
}

export default function ProductLinks({ links, type }: ProductLinksProps) {
  if (!links?.length) return null;

  const isSeries = type === "Series";

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Download Links</h2>
      {isSeries ? <SeriesLinks links={links} /> : <MovieLinks links={links} />}
    </div>
  );
}
