import { useEffect, useRef, useCallback } from 'react';

export const useScrollToBottom = (dependency: any[], enabled: boolean = true) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (enabled && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [enabled]);

  useEffect(() => {
    scrollToBottom();
  }, [...dependency, scrollToBottom]);

  return { scrollRef, scrollToBottom };
};