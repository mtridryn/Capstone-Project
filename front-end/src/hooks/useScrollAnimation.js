import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook untuk scroll-based animations
 * Menggunakan Intersection Observer API untuk mendeteksi elemen yang masuk viewport
 */
export const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
              if (triggerOnce) {
                setHasAnimated(true);
              }
            }, delay);
          } else {
            setIsVisible(true);
            if (triggerOnce) {
              setHasAnimated(true);
            }
          }
        } else if (!triggerOnce && !hasAnimated) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce, delay, hasAnimated]);

  return [elementRef, isVisible];
};

/**
 * Hook untuk staggered animations (animasi berurutan)
 */
export const useStaggeredAnimation = (itemCount, options = {}) => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const containerRef = useRef(null);

  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    staggerDelay = 100
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate items with stagger delay
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems(prev => new Set([...prev, i]));
            }, i * staggerDelay);
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(container);

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, [itemCount, threshold, rootMargin, staggerDelay]);

  return [containerRef, visibleItems];
};

/**
 * Hook untuk parallax effect
 */
export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      
      setOffset(rate);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return [elementRef, offset];
};

/**
 * Hook untuk scroll progress indicator
 */
export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.pageYOffset / totalHeight) * 100;
      setProgress(Math.min(currentProgress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
};

/**
 * Utility function untuk menambahkan class animasi
 */
export const getAnimationClasses = (isVisible, animationType = 'fadeInUp', delay = 0) => {
  const baseClasses = isVisible ? 'animate-fade-in-up' : 'opacity-0';
  const delayClass = delay > 0 ? `animate-delay-${delay}` : '';
  
  const animationMap = {
    fadeInUp: 'animate-fade-in-up',
    fadeInDown: 'animate-fade-in-down',
    fadeInLeft: 'animate-fade-in-left',
    fadeInRight: 'animate-fade-in-right',
    scaleIn: 'animate-scale-in',
    bounce: 'animate-bounce',
    float: 'animate-float',
    glow: 'animate-glow'
  };

  const animationClass = isVisible ? animationMap[animationType] || animationMap.fadeInUp : 'opacity-0';
  
  return `${animationClass} ${delayClass}`.trim();
};

export default useScrollAnimation;
