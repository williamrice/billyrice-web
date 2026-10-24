"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export default function ImageLightbox({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className = "",
  priority = false,
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management: focus dialog when opened, return focus when closed
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      const previouslyFocused = document.activeElement as HTMLElement;

      // Focus the close button when dialog opens
      closeButtonRef.current?.focus();

      // Return focus to trigger when dialog closes
      return () => {
        previouslyFocused?.focus();
      };
    }
  }, [isOpen]);

  // Focus trap: keep focus within dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (e.key === "Tab") {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab: going backwards
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: going forwards
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Thumbnail - clickable */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="relative cursor-zoom-in overflow-hidden w-full h-full"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-label={`View ${alt} in full size`}
      >
        {fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            className={`${className} transform hover:scale-105 transition-transform duration-500`}
            priority={priority}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className={`${className} transform hover:scale-105 transition-transform duration-500`}
            priority={priority}
          />
        )}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-secondary/80 text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image container */}
          <div
            className="relative max-w-7xl max-h-[90vh] w-full h-full p-4 cursor-zoom-out"
            onClick={(e) => {
              // Only close if clicking the container, not the image
              if (e.target === e.currentTarget) {
                setIsOpen(false);
              }
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
