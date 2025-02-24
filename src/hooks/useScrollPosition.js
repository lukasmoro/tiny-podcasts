import { useEffect, useState } from 'react';

const useScrollPosition = (containerId, itemsLength) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [indicatorIndex, setActiveIndicatorIndex] = useState(0);

  useEffect(() => {
    const parentContainer = document.getElementById(containerId);
    if (!parentContainer) return;

    const handleScroll = () => {
      const position = parentContainer.scrollLeft;
      setScrollPosition(position);
      const maxScrollLeft =
        parentContainer.scrollWidth - parentContainer.clientWidth;
      if (maxScrollLeft === 0) return;
      const scrollRatio = position / maxScrollLeft;
      const currentIndex = Math.round(scrollRatio * (itemsLength - 1));
      setActiveIndicatorIndex(currentIndex);
    };

    parentContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      parentContainer.removeEventListener('scroll', handleScroll);
    };
  }, [containerId, itemsLength]);

  return { scrollPosition, indicatorIndex };
};

export default useScrollPosition;
