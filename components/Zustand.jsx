import React, { useEffect } from 'react';
import useStore from '/Users/lukasmoro/Documents/React/podcasts-chrome-extension/src/pages/Newtab/Carousel.jsx'; // Adjust the import path to your store

function StateLogger() {
    // Access the global state using the useStore hook
    const { items } = useStore();

    // Use useEffect to log the state when the component mounts
    useEffect(() => {
        console.log('Global State:', items);
    }, [items]); // Include 'items' in the dependency array if you want to log updates

    return (
        <div>
            {/* Render your component content here if needed */}
        </div>
    );
}

export default StateLogger;
