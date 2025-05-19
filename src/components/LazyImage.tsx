import React, { useState } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
  width?: number;
  height?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = "",
  placeholderColor = "#f3f4f6",
  width,
  height,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: placeholderColor,
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
      }}
    >
      {isVisible && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={handleImageLoad}
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export default LazyImage;
