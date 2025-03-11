import React from 'react';
import './StatusIndicator.css';

const StatusIndicator = ({ podcastId }) => {
  const playbackStatus = null;

  const getStatusColor = () => {
    switch (playbackStatus) {
      // case currentStatus.UNPLAYED:
      //   return 'var(--unplayed-color, #19a0fc)';
      // case currentStatus.IN_PROGRESS:
      //   return 'var(--in-progress-color, #ffa500)';
      // case currentStatus.FINISHED:
      //   return 'var(--completed-color, #5dffb1)';
      default:
        return 'var(--default-color, #d0d0d0)';
    }
  };

  return (
    <div
      className="status-indicator"
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
