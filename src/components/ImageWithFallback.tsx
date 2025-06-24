import React, { useState, useImgProps } from 'react';
import { AlertCircle, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/utils';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
  showError?: boolean;
  errorMessage?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  showError = true,
  errorMessage = "Image failed to load",
  className,
  alt = "Image",
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    console.error('Image failed to load:', src);
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  // If no src provided, show placeholder
  if (!src) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-slate-800 text-slate-400",
        className
      )}>
        <ImageIcon className="size-8" />
      </div>
    );
  }

  // If image failed and we have a fallback, try fallback
  if (imageError && fallbackSrc && fallbackSrc !== src) {
    return (
      <ImageWithFallback
        src={fallbackSrc}
        className={className}
        alt={alt}
        showError={showError}
        errorMessage={errorMessage}
        {...props}
      />
    );
  }

  // If image failed and no fallback, show error state
  if (imageError) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-4",
        className
      )}>
        <AlertCircle className="size-6 mb-2 text-red-400" />
        {showError && (
          <span className="text-xs text-center">{errorMessage}</span>
        )}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-slate-800",
          className
        )}>
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onError={handleImageError}
        onLoad={handleImageLoad}
        {...props}
      />
    </>
  );
};