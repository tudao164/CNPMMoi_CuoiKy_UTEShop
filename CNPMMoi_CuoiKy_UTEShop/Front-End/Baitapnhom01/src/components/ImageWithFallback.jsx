import React, { useState } from 'react';

const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackSrc = "/dt1.jpg", 
  className = "", 
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  // Debug logging
  console.log('ImageWithFallback:', { 
    originalSrc: src, 
    currentSrc: imageSrc, 
    fallbackSrc, 
    hasError 
  });

  const handleError = () => {
    console.log('Image load error for:', imageSrc);
    if (!hasError && imageSrc !== fallbackSrc) {
      console.log('Switching to fallback:', fallbackSrc);
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    console.log('Image loaded successfully:', imageSrc);
    setHasError(false);
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default ImageWithFallback;
