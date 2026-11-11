"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
  disabled?: boolean;
};

export function ImagePreview({
  images,
  alt,
  className = "",
  imageClassName = "",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;
  const activeImage = images[activeIndex];

  useEffect(() => {
    if (!open || images.length < 2) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        setActiveIndex((index) => (index + 1) % images.length);
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((index) => (index - 1 + images.length) % images.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, images.length]);

  return (
    <>
      <button
        type="button"
        disabled={disabled || !hasImages}
        onClick={() => {
          setActiveIndex(0);
          setOpen(true);
        }}
        aria-label={hasImages ? `View ${alt}` : undefined}
        className={`group/image relative block overflow-hidden disabled:cursor-default ${className}`}
      >
        {hasImages && (
          <>
            {/* Product images are served by the API and should load directly. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[0]}
              alt={alt}
              className={`size-full object-cover ${imageClassName}`}
            />
            {!disabled && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover/image:bg-black/25 group-hover/image:opacity-100 group-focus-visible/image:bg-black/30 group-focus-visible/image:opacity-100">
                <Expand className="size-4 drop-shadow" />
              </span>
            )}
          </>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed inset-0 top-0 left-0 z-50 flex h-dvh w-screen max-w-none -translate-x-0 -translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-slate-950/95 p-0 text-white shadow-none backdrop-blur-xl sm:max-w-none"
        >
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/20 px-4 sm:px-7">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{alt}</p>
              {images.length > 1 && (
                <p className="mt-0.5 text-xs text-white/55">
                  {activeIndex + 1} of {images.length}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close image preview"
              className="ml-4 rounded-full text-white hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" />
            </Button>
          </header>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-5 sm:px-16 sm:py-8">
            {activeImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={activeImage}
                src={activeImage}
                alt={`${alt}${images.length > 1 ? `, image ${activeIndex + 1}` : ""}`}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl shadow-black/40"
              />
            )}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={() =>
                    setActiveIndex((index) => (index - 1 + images.length) % images.length)
                  }
                  aria-label="Previous image"
                  className="absolute left-3 size-11 rounded-full border border-white/10 bg-black/35 text-white backdrop-blur hover:bg-white/15 hover:text-white sm:left-6"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={() => setActiveIndex((index) => (index + 1) % images.length)}
                  aria-label="Next image"
                  className="absolute right-3 size-11 rounded-full border border-white/10 bg-black/35 text-white backdrop-blur hover:bg-white/15 hover:text-white sm:right-6"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <nav aria-label="Image thumbnails" className="flex shrink-0 justify-center gap-2 overflow-x-auto border-t border-white/10 bg-black/20 px-4 py-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className={`size-12 shrink-0 overflow-hidden rounded-lg border-2 transition ${index === activeIndex ? "border-white" : "border-white/15 opacity-60 hover:opacity-100"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" className="size-full object-cover" />
                </button>
              ))}
            </nav>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
