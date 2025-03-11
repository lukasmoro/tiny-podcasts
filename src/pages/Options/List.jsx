import React, { useRef, useEffect, useState } from 'react';
import { useSprings, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import clamp from 'lodash/clamp';
import swap from 'lodash-move';
import './List.css';

// subscribe to event
const PODCAST_UPDATED_EVENT = 'podcast-storage-updated';
const List = ({ items, removeUrl, moveItem }) => {
  // states
  const [itemHeight, setItemHeight] = useState(70); // default height for each list item
  const [isVisible, setIsVisible] = useState(false); // controls whether animations should play

  // refs (no re-render when updated)
  const containerRef = useRef(null); // reference to container element
  const itemsRef = useRef([]); // reference to each item element
  const order = useRef(items.map((_, index) => index)); // current order of items (as indices)
  const initialRenderRef = useRef(true); // flag for first render
  const lastReorderedRef = useRef(null); // last reordering operation??
  const lastProcessedItemsRef = useRef([]); // last processed items??
  const pendingDragUpdateRef = useRef(null); // refs for debouncing drag updates??
  const lastDragTimestampRef = useRef(0); // refs for debouncing drag updates??

  // useEffect that triggers animations when reordering event happens through storage
  useEffect(() => {
    const handleStorageUpdate = (event) => {
      if (event.detail.action === 'reorder' && !initialRenderRef.current) {
        api.start(fn(order.current));
      }
    };
    window.addEventListener(PODCAST_UPDATED_EVENT, handleStorageUpdate);
    return () => {
      window.removeEventListener(PODCAST_UPDATED_EVENT, handleStorageUpdate);
    };
  }, []);

  // useEffect that sets up initial state and prevents animations on first render
  useEffect(() => {
    order.current = items.map((_, index) => index);
    lastProcessedItemsRef.current = [...items];
    setItemHeight(70);
    setIsVisible(true);
    initialRenderRef.current = false;
  }, []);

  //useEffect to update order when items change after initial render
  useEffect(() => {
    if (!initialRenderRef.current) {
      order.current = items.map((_, index) => index);
      lastProcessedItemsRef.current = [...items];
    }
  }, [items]);

  //animation config for react-spring
  const fn =
    (order, active = false, originalIndex = 0, curIndex = 0, y = 0) =>
    (index) => {
      // if this is the item being dragged
      if (active && index === originalIndex) {
        return {
          y: curIndex * itemHeight + y, // position based on current index + drag offset
          scale: 1.03, // slightly larger scale to indicate selection
          zIndex: 1, // bring to front
          immediate: (key) => key === 'y' || key === 'zIndex', // no animation for position and z-index
        };
      }

      // for all other items
      return {
        y: order.indexOf(index) * itemHeight, // position based on current order
        scale: 1, // normal scale
        zIndex: 0, // normal z-index
        shadow: 1, // normal shadow
        immediate: !isVisible, // skip animation if not visible yet
        config: { tension: 300, friction: 30 }, // spring animation config
      };
    };

  // intialise react-spring hooks to animate items, each item has own spring animation
  const [springs, api] = useSprings(items.length, (index) => ({
    y: index * itemHeight,
    scale: 1,
    zIndex: 0,
    immediate: true,
  }));

  // setup drag gesture handlers using use-gesture
  // handles the dragging and reordering of items
  const bind = useDrag(
    ({ args: [originalIndex], active, movement: [_, y], last }) => {
      // find current index of the dragged item
      const curIndex = order.current.indexOf(originalIndex);

      // calculate the row where the item would land based on drag position
      const curRow = clamp(
        Math.round((curIndex * itemHeight + y) / itemHeight),
        0,
        items.length - 1
      );

      // create a new order by swapping the item to its new position
      const newOrder = swap(order.current, curIndex, curRow);

      // start animation with the new calculated positions
      api.start(fn(newOrder, active, originalIndex, curIndex, y));

      // when drag ends
      if (!active && last) {
        // only process if the position actually changed
        if (curIndex !== curRow) {
          // store information about the reordering
          lastReorderedRef.current = {
            originalIndex,
            curIndex,
            curRow,
          };

          // update the order reference
          order.current = newOrder;
          api.start(fn(order.current));

          // debounce the update to prevent floods of storage updates
          pendingDragUpdateRef.current = setTimeout(() => {
            lastDragTimestampRef.current = Date.now();
            moveItem(curIndex, curRow);
            pendingDragUpdateRef.current = null;
          }, 500);
        }
      }
    }
  );

  // handler for remove
  const handleRemove = (key) => {
    removeUrl(key);
  };

  return (
    <div className="podcast-items-container" ref={containerRef}>
      {springs.map(({ y, scale, zIndex }, i) => (
        <animated.div
          key={items[i]?.key || `item-${i}`}
          ref={(el) => (itemsRef.current[i] = el)}
          {...bind(i)}
          style={{
            zIndex,
            y,
            scale,
            position: 'absolute',
            width: '100%',
            touchAction: 'none',
          }}
          className="podcast-item-wrapper"
        >
          <div className="podcast-items">
            <img
              className="podcast-item-thumbnail"
              src={items[i]?.image}
              alt={items[i]?.title || 'Podcast'}
            />
            <p
              className={
                items[i]?.title?.length > 10
                  ? 'podcast-item-title podcast-truncate-text'
                  : 'podcast-item-title'
              }
            >
              {items[i]?.title || 'Unnamed Podcast'}
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
