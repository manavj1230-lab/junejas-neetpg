'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageZoomLightboxProps {
  src: string | null;
  onClose: () => void;
}

export function ImageZoomLightbox({ src, onClose }: ImageZoomLightboxProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; origX: number; origY: number } | null>(null);
  const pinchStartRef = useRef<{ dist: number; startScale: number } | null>(null);

  // Reset zoom whenever a new image opens
  useEffect(() => {
    if (src) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [src]);

  // Escape key closes lightbox
  useEffect(() => {
    if (!src) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        setScale((s) => Math.min(4, Math.round((s + 0.25) * 100) / 100));
      } else if (e.key === '-') {
        setScale((s) => {
          const next = Math.max(1, Math.round((s - 0.25) * 100) / 100);
          if (next === 1) setOffset({ x: 0, y: 0 });
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [src, onClose]);

  if (!src) return null;

  const adjustScale = (delta: number) => {
    setScale((prev) => {
      const next = Math.max(1, Math.min(4, Math.round((prev + delta) * 100) / 100));
      if (next === 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // PC Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    adjustScale(delta);
  };

  // PC Click & Drag Panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      origX: offset.x,
      origY: offset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    setOffset({
      x: dragStartRef.current.origX + (e.clientX - dragStartRef.current.x),
      y: dragStartRef.current.origY + (e.clientY - dragStartRef.current.y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Mobile Two-Finger Pinch-to-Zoom & Single-Finger Pan
  const getTouchDist = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      dragStartRef.current = null;
      pinchStartRef.current = {
        dist: getTouchDist(e.touches[0], e.touches[1]),
        startScale: scale,
      };
    } else if (e.touches.length === 1 && scale > 1) {
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        origX: offset.x,
        origY: offset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      const ratio = dist / pinchStartRef.current.dist;
      const next = Math.max(1, Math.min(4, Math.round(pinchStartRef.current.startScale * ratio * 100) / 100));
      setScale(next);
      if (next === 1) setOffset({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && dragStartRef.current && scale > 1) {
      setOffset({
        x: dragStartRef.current.origX + (e.touches[0].clientX - dragStartRef.current.x),
        y: dragStartRef.current.origY + (e.touches[0].clientY - dragStartRef.current.y),
      });
    }
  };

  const handleTouchEnd = () => {
    pinchStartRef.current = null;
    dragStartRef.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex flex-col justify-between select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Bar with Prominent Close (X) */}
      <div className="flex items-center justify-between px-4 py-3 z-10">
        <span className="text-xs text-slate-300 font-medium bg-slate-900/80 border border-slate-700/70 px-3 py-1 rounded-full">
          Pinch, scroll wheel, or use buttons to zoom
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image zoom"
          className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Zoomable / Pannable Image Viewport */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden touch-none p-4"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if (e.target === e.currentTarget && scale === 1) onClose();
        }}
      >
        <img
          src={src}
          alt="Zoomed Clinical Diagram"
          draggable={false}
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 120ms ease-out',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (scale === 1) adjustScale(0.75);
          }}
          className="max-h-[80vh] max-w-[95vw] w-auto object-contain rounded-xl shadow-2xl"
        />
      </div>

      {/* Bottom Zoom Controls: - | 100% | + */}
      <div className="flex items-center justify-center pb-6 pt-2 z-10">
        <div className="inline-flex items-center gap-1.5 bg-slate-900/95 border border-slate-700/80 rounded-full px-3 py-1.5 shadow-2xl">
          <button
            type="button"
            onClick={() => adjustScale(-0.25)}
            disabled={scale <= 1}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="px-3 py-1 rounded-full text-xs font-mono font-bold text-sky-300 hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="Reset to 100%"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{Math.round(scale * 100)}%</span>
          </button>
          <button
            type="button"
            onClick={() => adjustScale(0.25)}
            disabled={scale >= 4}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
