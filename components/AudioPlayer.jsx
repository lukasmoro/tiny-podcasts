import React, { useState, useRef, useEffect } from 'react';
import './AudioPlayer.css';

const AudioPlayer = () => {

    //integrate data from chrome.storage
    //style audioplayer
    //animate audioplayer using react spring
    //store currentTime variable in chrome.storage

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const togglePlayPause = () => {
        const prevValue = isPlaying;
        setIsPlaying(!prevValue);
        if (prevValue) {
            audioPlayer.current.play();
        } else {
            audioPlayer.current.pause();
        }
    }

    const audioPlayer = useRef();

    const onLoadedMetadata = () => {
        const seconds = Math.floor(audioPlayer.current.duration);
        setDuration(seconds);
    };

    // useEffect(() => {
    //     const seconds = Math.floor(audioPlayer.current.duration);
    //     setDuration(seconds);
    // }, [audioPlayer?.current?.loadedmetadata, audioPlayer?.current?.readyState])

    const calculateTime = (secs) => {
        const minutes = Math.floor(secs / 60);
        const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
        const seconds = secs % 60;
        const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${returnedMinutes}:${returnedSeconds}`


    }

    return (
        <div className='audio-player'>
            {/* add logic to get data from chrome.storage.local */}
            <audio ref={audioPlayer} src="https://media.blubrry.com/takeituneasy/content.blubrry.com/takeituneasy/lex_ai_andrew_huberman_4.mp3" preload="metadata" onLoadedMetadata={onLoadedMetadata} ></audio>
            <button className='forward-backward'>back 30</button>
            <button className='play-pause' onClick={togglePlayPause}>{isPlaying ? <p>play</p> : <p>pause</p>}</button>
            <button className='forward-backward'>front 30</button>
            <div className='current-time'>{calculateTime(currentTime)}</div>
            <div><input type="range" /></div>
            {/* add logic for saving current duration to chrome.storage.local and then playing from there the next time */}
            <div className='duration' >{(duration && !isNaN(duration)) && calculateTime(duration)}</div>
        </div >
    )
}

export default AudioPlayer;