import { useState, useEffect, useRef, RefObject } from "react";

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

/**
 * Hook to detect when an element is visible in the viewport
 * Useful for lazy loading images and implementing infinite scroll
 */
export function useIntersectionObserver<T extends Element>(
  options: IntersectionObserverOptions = {},
): [RefObject<T>, boolean] {
  const {
    root = null,
    rootMargin = "0px",
    threshold = 0,
    triggerOnce = false,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Cleanup previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        // If element is intersecting and we only want to trigger once, unobserve
        if (isElementIntersecting && triggerOnce && observerRef.current) {
          observerRef.current.unobserve(element);
        }
      },
      { root, rootMargin, threshold },
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [root, rootMargin, threshold, triggerOnce]);

  return [elementRef, isIntersecting];
}
