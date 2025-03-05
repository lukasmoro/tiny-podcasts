import React, { useRef, useEffect, useState } from 'react';
import { useSprings, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import clamp from 'lodash/clamp';
import swap from 'lodash-move';
import './List.css';

const List = ({
  items,
  removeUrl,
  moveItem,
  onDragStateChange,
  isPopup = false,
}) => {
  const [itemHeight, setItemHeight] = useState(70);
  const [isMeasured, setIsMeasured] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const itemsRef = useRef([]);
  const order = useRef(items.map((_, index) => index));
  const animationCompleteRef = useRef(true);
  const initialRenderRef = useRef(true);
  const lastReorderedRef = useRef(null);

  // Debug log to track items and order
  useEffect(() => {
    console.log(
      'Items updated:',
      items.map((item) => item.podcastName || item.key)
    );
    console.log('Current order ref:', order.current);

    // In popup mode, always sync order ref with items when items change
    if (isPopup && !initialRenderRef.current) {
      console.log('Popup mode: Re-syncing order ref with items');
      order.current = items.map((_, index) => index);
    }
  }, [items, isPopup]);

  // Initialize positions and prevent any animations on first render
  useEffect(() => {
    if (initialRenderRef.current) {
      // Update order ref
      order.current = items.map((_, index) => index);

      // Use RAF to ensure this happens after initial render
      const rafId = requestAnimationFrame(() => {
        // First measure the items if possible
        if (itemsRef.current[0]) {
          const height =
            itemsRef.current[0].getBoundingClientRect().height + 10;
          setItemHeight(height);
        }

        // Then mark as measured to prevent animations
        setIsMeasured(true);

        // Short delay to ensure styles are applied before showing
        setTimeout(() => {
          setIsVisible(true);
          initialRenderRef.current = false;
        }, 50);
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [items]);

  // Update order ref when items change (after initial render)
  useEffect(() => {
    if (!initialRenderRef.current && animationCompleteRef.current) {
      console.log('Updating order ref based on items');
      order.current = items.map((_, index) => index);
    }
  }, [items]);

  // For popup: Force refresh animationComplete state after each drag
  useEffect(() => {
    if (isPopup && lastReorderedRef.current) {
      const resetTimer = setTimeout(() => {
        console.log('Popup: Force resetting animation state');
        animationCompleteRef.current = true;
        lastReorderedRef.current = null;
      }, 50);

      return () => clearTimeout(resetTimer);
    }
  }, [isPopup, items]);

  // The animation function
  const fn =
    (order, active = false, originalIndex = 0, curIndex = 0, y = 0) =>
    (index) => {
      if (active && index === originalIndex) {
        return {
          y: curIndex * itemHeight + y,
          scale: 1.03,
          zIndex: 1,
          opacity: 1,
          immediate: (key) => key === 'y' || key === 'zIndex',
        };
      }

      return {
        y: order.indexOf(index) * itemHeight,
        scale: 1,
        zIndex: 0,
        opacity: isVisible ? 1 : 0, // Hide items until measured
        shadow: 1,
        // Force immediate:true for all properties until fully measured and visible
        // Also force immediate in popup mode for better responsiveness
        immediate:
          !isVisible ||
          (!active && index !== originalIndex) ||
          (isPopup && !active),
        config: isPopup
          ? { tension: 400, friction: 40 }
          : { tension: 300, friction: 30 },
      };
    };

  // Create springs with initial positions and no animation
  const [springs, api] = useSprings(items.length, (index) => ({
    y: index * itemHeight,
    scale: 1,
    zIndex: 0,
    opacity: 0, // Start invisible
    immediate: true, // Force immediate for initial positioning
  }));

  // Update springs once measurements and visibility are set
  useEffect(() => {
    if (isMeasured) {
      api.start(fn(order.current));
    }
  }, [isMeasured, isVisible, itemHeight, api]);

  const bind = useDrag(
    ({ args: [originalIndex], active, movement: [_, y], last }) => {
      if (onDragStateChange) {
        onDragStateChange(active);
      }

      // Skip drag handling during initial render
      if (initialRenderRef.current) return;

      // In popup, reset animation state on each drag start
      if (isPopup && active) {
        animationCompleteRef.current = false;
      } else {
        // For non-popup, use the existing approach
        animationCompleteRef.current = !active;
      }

      const curIndex = order.current.indexOf(originalIndex);

      const curRow = clamp(
        Math.round((curIndex * itemHeight + y) / itemHeight),
        0,
        items.length - 1
      );

      const newOrder = swap(order.current, curIndex, curRow);

      // In popup mode, use more immediate animation
      api.start(fn(newOrder, active, originalIndex, curIndex, y));

      if (!active && last) {
        // Only call moveItem when the position actually changed
        if (curIndex !== curRow) {
          // Save info about this reordering operation
          lastReorderedRef.current = {
            originalIndex,
            curIndex,
            curRow,
            timestamp: Date.now(),
          };

          console.log('Drag completed:', {
            originalIndex,
            curIndex,
            curRow,
            newOrder: JSON.stringify(newOrder),
            isPopup,
          });

          // For popups, we need to take a more direct approach
          if (isPopup) {
            // Update internal ref first
            order.current = newOrder;

            // Call moveItem synchronously for popups with no delay
            moveItem(curIndex, curRow);
            console.log(
              'moveItem called immediately (popup mode):',
              curIndex,
              curRow
            );

            // Force a re-application of the visual order
            requestAnimationFrame(() => {
              api.start(fn(order.current));

              // Reset animation state after a short delay
              setTimeout(() => {
                animationCompleteRef.current = true;
              }, 50);
            });
          } else {
            // In regular mode, use the existing timeout approach
            order.current = newOrder;

            setTimeout(() => {
              // Convert from visual indices to actual data indices
              moveItem(curIndex, curRow);
              console.log('moveItem called with delay:', curIndex, curRow);
              animationCompleteRef.current = true;
            }, 300); // Adjust timeout to match your animation duration
          }
        } else {
          order.current = newOrder;
          animationCompleteRef.current = true;
        }

        // Final animation cleanup
        api.start((index) => {
          if (index === originalIndex) {
            return {
              scale: 1,
              shadow: 1,
              immediate: isPopup, // Force immediate in popup mode
            };
          }
          return {};
        });
      }
    }
  );

  // Remove item handler
  const handleRemove = (key) => {
    removeUrl(key);
  };

  // Render with CSS to completely hide items until they're properly positioned
  return (
    <div
      className="podcast-items-container"
      ref={containerRef}
      style={{
        height: items.length * itemHeight,
        visibility: isVisible ? 'visible' : 'hidden', // Hide container until ready
      }}
    >
      {springs.map(({ y, scale, zIndex, opacity }, i) => (
        <animated.div
          key={items[i]?.key || `item-${i}`}
          ref={(el) => (itemsRef.current[i] = el)}
          {...bind(i)}
          style={{
            zIndex,
            y,
            scale,
            opacity,
            position: 'absolute',
            width: '100%',
            touchAction: 'none',
          }}
          className="podcast-item-wrapper"
        >
          <div className="podcast-items">
            <img
              className="podcast-item-thumbnail"
              src={items[i]?.artwork}
              alt={items[i]?.podcastName || 'Podcast'}
            />
            <p
              className={
                items[i]?.podcastName?.length > 10
                  ? 'podcast-item-title podcast-truncate-text'
                  : 'podcast-item-title'
              }
            >
              {items[i]?.podcastName || 'Unnamed Podcast'}
            </p>
            <button
              className="podcast-remove-btn"
              onClick={() => handleRemove(items[i]?.key, i)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              Remove
            </button>
          </div>
        </animated.div>
      ))}
    </div>
  );
};

export default List;
