'use client';

import React, { useState } from 'react';
import { ImageZoomLightbox } from '@/components/ImageZoomLightbox';

/**
 * Checks if a card text contains Anki Cloze deletion syntax ({{c1::...}} or {c1::...})
 */
export function hasClozeSyntax(raw: string): boolean {
  if (!raw) return false;
  return /\{\{?c\d+::.*?\}\}?/i.test(raw);
}

/**
 * Strips HTML tags and cloze braces to compare plain text (used to avoid duplicating
 * the exact same sentence when a deck stores the filled sentence in `answer`).
 */
export function stripHtmlAndCloze(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\{\{c\d+::(.*?)(?:::.*?)?\}\}/gi, '$1')
    .replace(/\{c\d+::(.*?)(?:::.*?)?\}/gi, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Checks whether a card has genuine clinical pearl / extra note text (not empty or generic placeholder)
 */
export function hasGenuinePearl(clinicalPearl?: string, explanation?: string): boolean {
  const pearlClean = (clinicalPearl || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  const isPlaceholder = /High-Yield Clinical Pearl$/i.test(pearlClean);
  const hasRealPearl = pearlClean.length > 0 && !isPlaceholder;

  const expClean = (explanation || '')
    .replace(/<div[^>]*class=["']?[^"']*ome-widget[^"']*["']?[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim();

  return hasRealPearl || expClean.length > 0;
}

/**
 * Parses Anki card content:
 * 1. Cloze deletions: {{c1::target}} or {c1::target} or {{c1::target::hint}}
 *    - In question mode (front): replaces active cloze with "[...]" in blue
 *    - In answer mode (back): replaces cloze inline with bold blue/emerald revealed text
 * 2. Image sources: replaces raw filename <img src="xyz.png"> with <img src="/deck_media/xyz.png">
 *    - Supports filenames with spaces and adds onerror="this.remove()" so missing images never show broken icons.
 * 3. Strips external <a> links and OnlineMedEd widgets.
 */
export function formatCardHtml(raw: string, isQuestion: boolean): string {
  if (!raw) return '';

  let formatted = raw
    .replace(/<div[^>]*class=["']?[^"']*ome-widget[^"']*["']?[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, '');

  // 1. Robust image path handling: supports quoted (with spaces) and unquoted src attributes
  formatted = formatted.replace(
    /<img\b([^>]*?)src=(?:"([^"]+)"|'([^']+)'|([^\s>]+))([^>]*)>/gi,
    (match, before, qDouble, qSingle, unquoted, after) => {
      const src = (qDouble ?? qSingle ?? unquoted ?? '').trim();
      if (!src) return '';

      let finalSrc = src;
      if (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:')) {
        const cleanName = src.replace(/^\.?\//, '').replace(/^deck[-_]media\//, '');
        finalSrc = `/deck_media/${cleanName.split('/').map(encodeURIComponent).join('/')}`;
      }

      // Preserve absolute-positioned SVG/PNG occlusion mask overlays inside .io-stack without wrapping
      const attrs = `${before} ${after}`;
      if (/position\s*:\s*absolute/i.test(attrs)) {
        return `<img src="${finalSrc}" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;" alt="" loading="lazy" onerror="this.remove()" />`;
      }

      return `<span class="relative block group/img my-3 text-center"><img src="${finalSrc}" class="max-h-80 w-auto max-w-full rounded-xl mx-auto border border-slate-700/60 object-contain shadow-lg bg-black/40 block cursor-zoom-in transition-transform hover:scale-[1.01]" alt="" loading="lazy" onerror="this.parentElement?.remove()" /><span class="pointer-events-none inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/85 border border-slate-700/80 text-[10px] font-medium text-slate-300 opacity-80 group-hover/img:opacity-100">🔍 Tap to zoom</span></span>`;
    }
  );

  // 2. Parse clozes: {{c1::answer(::hint)?}} or {c1::answer(::hint)?}
  if (isQuestion) {
    formatted = formatted.replace(/\{\{c\d+::(.*?)(?:::.*?)?\}\}/gi, () => {
      return `<span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/40 font-mono">[...]</span>`;
    });
    formatted = formatted.replace(/\{c\d+::(.*?)(?:::.*?)?\}/gi, () => {
      return `<span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-500/40 font-mono">[...]</span>`;
    });
  } else {
    // Back side: reveal cloze inline in bold blue/sky matching real Anki
    formatted = formatted.replace(/\{\{c\d+::(.*?)(?:::.*?)?\}\}/gi, (m, ans) => {
      return `<span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border-b-2 border-sky-400">${ans}</span>`;
    });
    formatted = formatted.replace(/\{c\d+::(.*?)(?:::.*?)?\}/gi, (m, ans) => {
      return `<span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border-b-2 border-sky-400">${ans}</span>`;
    });
  }

  return formatted;
}

export function FormattedCardContent({
  content,
  isQuestion = false,
  className = '',
}: {
  content: string;
  isQuestion?: boolean;
  className?: string;
}) {
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const html = formatCardHtml(content, isQuestion);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'IMG') {
      e.stopPropagation();
      const imgEl = target as HTMLImageElement;
      if (imgEl.src) {
        setZoomSrc(imgEl.src);
      }
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`anki-card-content leading-relaxed break-words [&_a]:text-sky-400 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <ImageZoomLightbox src={zoomSrc} onClose={() => setZoomSrc(null)} />
    </>
  );
}
