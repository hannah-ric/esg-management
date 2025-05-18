import { useState, useEffect, useRef, RefObject } from "react";

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  /**
   * Delay in ms before starting to observe the element
   * Useful when elements might not be immediately available in the DOM
   */
  observeDelay?: number;
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
    observeDelay = 0,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing timeout to prevent memory leaks
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Cleanup previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const setupObserver = () => {
      const element = elementRef.current;
      // Don't proceed if element doesn't exist
      if (!element) return;

      try {
        // Create new observer
        observerRef.current = new IntersectionObserver(
          (entries) => {
            // Check if entries exist and are valid
            if (entries && entries.length > 0) {
              const isElementIntersecting = entries[0].isIntersecting;
              setIsIntersecting(isElementIntersecting);

              // If element is intersecting and we only want to trigger once, unobserve
              if (
                isElementIntersecting &&
                triggerOnce &&
                observerRef.current &&
                element
              ) {
                try {
                  observerRef.current.unobserve(element);
                } catch (error) {
                  console.error("Error unobserving element:", error);
                }
              }
            }
          },
          { root, rootMargin, threshold },
        );

        try {
          observerRef.current.observe(element);
        } catch (error) {
          console.error("Error observing element:", error);
        }
      } catch (error) {
        console.error("Error creating IntersectionObserver:", error);
      }
    };

    // Use timeout to delay observation if needed
    if (observeDelay > 0) {
      timeoutRef.current = window.setTimeout(setupObserver, observeDelay);
    } else {
      setupObserver();
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (observerRef.current) {
        try {
          observerRef.current.disconnect();
        } catch (error) {
          console.error("Error disconnecting observer:", error);
        }
        observerRef.current = null;
      }
    };
  }, [root, rootMargin, threshold, triggerOnce, observeDelay]);

  return [elementRef, isIntersecting];
}
