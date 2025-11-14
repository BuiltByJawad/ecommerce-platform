'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface ProductImageZoomProps {
  imageSrc: string;
  imageAlt: string;
}

const ProductImageZoom = ({ imageSrc, imageAlt }: ProductImageZoomProps) => {
  // State for zoom effect
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  //lens and zoomed window sizes
  const lensSize = 100;
  const zoomWindowSize = 500;

  //handler for position calculation (used by both mouse and touch)
  const updateZoomPosition = (clientX: number, clientY: number) => {
    if (!imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = clientX - left;
    const y = clientY - top;

    const lensX = x - lensSize / 2;
    const lensY = y - lensSize / 2;

    const boundedLensX = Math.max(0, Math.min(lensX, width - lensSize));
    const boundedLensY = Math.max(0, Math.min(lensY, height - lensSize));

    setLensPosition({ x: boundedLensX, y: boundedLensY });

    const zoomX = (boundedLensX / (width - lensSize)) * 100;
    const zoomY = (boundedLensY / (height - lensSize)) * 100;

    setZoomPosition({ x: zoomX, y: zoomY });
  };

  //.ouse handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateZoomPosition(e.clientX, e.clientY);
  };

  const handleMouseEnter = () => {
    if (!isOverlayActive) {
      setIsZoomed(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  //touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); //prevent scrolling while zooming
    setIsZoomed(true);
    const touch = e.touches[0];
    updateZoomPosition(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); //prevent scrolling
    if (!isZoomed) return;
    const touch = e.touches[0];
    updateZoomPosition(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsZoomed(false);
  };

  // Monitor for backdrop/overlay elements
  useEffect(() => {
    const checkForOverlays = () => {
      // Check for search backdrop specifically
      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-30');
      const isBackdropVisible = backdrop && window.getComputedStyle(backdrop).display !== 'none';

      // Check for any high z-index elements that might be overlays
      const highZElements = document.querySelectorAll('[style*="z-index"]');
      const hasHighZOverlay = Array.from(highZElements).some((el) => {
        const style = window.getComputedStyle(el);
        const zIndex = parseInt(style.zIndex);
        return zIndex > 100 && style.position === 'fixed' && style.display !== 'none';
      });

      const overlayActive = !!(isBackdropVisible || hasHighZOverlay);
      setIsOverlayActive(overlayActive);

      // If overlay becomes active and zoom is currently on, turn it off
      if (overlayActive && isZoomed) {
        setIsZoomed(false);
      }
    };

    // Set up mutation observer to watch for DOM changes
    const observer = new MutationObserver(checkForOverlays);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Initial check
    checkForOverlays();

    return () => observer.disconnect();
  }, [isZoomed]);

  //calculate image dimensions for zoom factor
  const imageWidth = imageRef.current?.getBoundingClientRect().width || 400;
  const imageHeight = imageRef.current?.getBoundingClientRect().height || 400;
  const zoomFactor = zoomWindowSize / lensSize;

  return (
    <div className='w-1/3 relative top-0 self-start' style={{ height: 'fit-content' }}>
      <div
        ref={imageRef}
        className='relative touch-none'
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isZoomed ? 'none' : 'zoom-in' }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={400}
          height={400}
          priority
          className='object-cover w-full rounded-lg shadow-md select-none'
        />
        {isZoomed && (
          <div
            className='absolute border-2 border-gray-400 bg-gray-200 bg-opacity-30 pointer-events-none'
            style={{
              width: `${lensSize}px`,
              height: `${lensSize}px`,
              left: `${lensPosition.x}px`,
              top: `${lensPosition.y}px`,
            }}
          />
        )}
        {isZoomed && (
          <div
            className='fixed border border-gray-300 rounded-lg shadow-lg overflow-hidden z-10'
            style={{
              width: `${zoomWindowSize}px`,
              height: `${zoomWindowSize}px`,
              top: '20%',
              left: '35%',
              backgroundImage: `url(${imageSrc})`,
              backgroundSize: `${imageWidth * zoomFactor}px ${imageHeight * zoomFactor}px`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            }}
          />
        )}
      </div>
      <div className='flex gap-2 mt-4'>
        <Image
          src={imageSrc}
          alt='Thumbnail 1'
          width={80}
          height={80}
          className='object-cover rounded-md cursor-pointer'
        />
        <Image
          src={imageSrc}
          alt='Thumbnail 2'
          width={80}
          height={80}
          className='object-cover rounded-md cursor-pointer'
        />
        <Image
          src={imageSrc}
          alt='Thumbnail 3'
          width={80}
          height={80}
          className='object-cover rounded-md cursor-pointer'
        />
      </div>
    </div>
  );
};

export default ProductImageZoom;
