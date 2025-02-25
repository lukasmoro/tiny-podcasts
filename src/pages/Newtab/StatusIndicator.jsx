import React from 'react';
import usePlaybackPosition from '../../hooks/usePlaybackPosition';
import './StatusIndicator.css';

const StatusIndicator = ({ podcastId }) => {
  const { status: playbackStatus, PLAYBACK_STATUS } =
    usePlaybackPosition(podcastId);

  const getStatusColor = () => {
    switch (playbackStatus) {
      case PLAYBACK_STATUS.UNPLAYED:
        return 'var(--unplayed-color, #19a0fc)';
      case PLAYBACK_STATUS.IN_PROGRESS:
        return 'var(--in-progress-color, #ffa500)';
      case PLAYBACK_STATUS.FINISHED:
        return 'var(--completed-color, #5dffb1)';
      default:
        return 'var(--default-color, #d0d0d0)';
    }
  };

  return (
    <div
      className="status-indicator"
      title={`Status: ${playbackStatus}`}
      style={{
        backgroundColor: getStatusColor(),
        '--outline-color': getStatusColor(),
      }}
    >
      <span className="status-dot"></span>
    </div>
  );
};

export default StatusIndicator;
