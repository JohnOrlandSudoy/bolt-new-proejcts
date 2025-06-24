import React, { useState, useEffect } from 'react';
import { AlertCircle, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { cn } from '@/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  showError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  showError = true,
  errorMessage = "Image failed to load",
  className,
  alt = "Image",
  onRetry,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Reset states when src changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
    setCurrentSrc(src);
  }, [src]);

  const handleImageError = () => {
    console.error('Image failed to load:', currentSrc);
    setIsLoading(false);
    
    // Try fallback if available and not already tried
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      console.log('Trying fallback image:', fallbackSrc);
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      return;
    }
    
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', currentSrc);
    setIsLoading(false);
    setImageError(false);
  };

  const handleRetry = () => {
    setImageError(false);
    setIsLoading(true);
    setCurrentSrc(src); // Reset to original src
    if (onRetry) {
      onRetry();
    }
  };

  // If no src provided, show placeholder
  if (!currentSrc) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-slate-800 text-slate-400 border-2 border-dashed border-slate-600",
        className
      )}>
        <div className="text-center">
          <ImageIcon className="size-8 mx-auto mb-2" />
          <span className="text-xs">No image</span>
        </div>
      </div>
    );
  }

  // If image failed, show error state
  if (imageError) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-4 border-2 border-dashed border-red-500/30",
        className
      )}>
        <AlertCircle className="size-6 mb-2 text-red-400" />
        {showError && (
          <span className="text-xs text-center mb-2 text-red-300">{errorMessage}</span>
        )}
        {onRetry && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
          >
            <RefreshCw className="size-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-10">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onError={handleImageError}
        onLoad={handleImageLoad}
        {...props}
      />
    </div>
  );
};