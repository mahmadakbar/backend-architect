"use client";

import { useState } from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { emptyImage } from "@assets/images";

interface ImageProps extends Omit<NextImageProps, "src"> {
  src: string | null | undefined;
  alt: string;
}

export function Image({ src, alt, onError, ...props }: ImageProps) {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src || emptyImage);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(emptyImage);
      onError?.(e);
    }
  };

  return (
    <NextImage
      {...props}
      src={imageSrc}
      alt={alt}
      onError={handleError}
      unoptimized
    />
  );
}
