import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { emitWebsiteShare } from '../socketConn/socketConn';

const WebsiteShareControl = ({ roomID, userID, isTeacher }) => {
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Use the isSharing state from Redux instead of local state
  const isSharing = useSelector((state) => state.website.isSharing);

  // Listen for changes to isSharing and reset the URL input when sharing is complete
  useEffect(() => {
    if (!isSharing && websiteUrl !== '') {
      setWebsiteUrl('');
    }
  }, [isSharing, websiteUrl]);

  // Only teachers should be able to share websites
  if (!isTeacher) {
    return null;
  }

  const handleShare = () => {
    if (!websiteUrl) return;

    emitWebsiteShare({ websiteUrl, roomID, userID });
    // No need to set local state, Redux will handle it
  };

  return (
    <div style={{
      display: 'flex',
      margin: '10px 0',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }}>
      <input
        type="url"
        placeholder="Enter website URL to share"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        style={{
          flex: '1',
          padding: '10px 15px',
          fontSize: '14px',
          border: 'none',
          borderRight: 'none',
          outline: 'none',
          backgroundColor: '#333',
          color: '#fff'
        }}
      />
      <button
        onClick={handleShare}
        disabled={!websiteUrl || isSharing}
        style={{
          padding: '10px 15px',
          fontSize: '14px',
          fontWeight: '600',
          color: 'white',
          backgroundColor: isSharing ? '#444' : '#333',
          border: 'none',
          cursor: websiteUrl && !isSharing ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isSharing ? 'Sharing...' : 'Share Website'}
      </button>
    </div>
  );
};

export default WebsiteShareControl;