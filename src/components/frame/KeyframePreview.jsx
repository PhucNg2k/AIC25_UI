import React from 'react';
import { BASE_DATA_PATH } from '../../utils/metadata';
export default function KeyframePreview({ relatedFrames, currentIndex }) {
  // Indices around current
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < relatedFrames.length - 1;

  const prevIndex = hasPrev ? currentIndex - 1 : currentIndex;
  const nextIndex = hasNext ? currentIndex + 1 : currentIndex;

  //const BASE_DATA_PATH = "/REAL_DATA/Data/keyframes_beit3";

  const prevSrc = `${BASE_DATA_PATH}/${relatedFrames[prevIndex]}`;
  const currentSrc = `${BASE_DATA_PATH}/${relatedFrames[currentIndex]}`;
  const nextSrc = `${BASE_DATA_PATH}/${relatedFrames[nextIndex]}`;

  return (
    <div className="keyframe-preview">
      <div className="preview-container">
        {/* Left slot: previous or placeholder */}
        {hasPrev ? (
          <div className="preview-frame side-frame">
            <div className="image-wrapper">
              <img src={prevSrc} alt={`Keyframe ${prevIndex + 1}`} className="frame-image" />
            </div>
          </div>
        ) : (
          <div className="preview-frame side-frame" style={{ visibility: 'hidden' }}>
            <div className="image-wrapper" />
          </div>
        )}

        {/* Middle slot: current */}
        <div className="preview-frame current-frame">
          <div className="image-wrapper">
            <img src={currentSrc} alt={`Keyframe ${currentIndex + 1}`} className="frame-image" />
          </div>
        </div>

        {/* Right slot: next or placeholder */}
        {hasNext ? (
          <div className="preview-frame side-frame">
            <div className="image-wrapper">
              <img src={nextSrc} alt={`Keyframe ${nextIndex + 1}`} className="frame-image" />
            </div>
          </div>
        ) : (
          <div className="preview-frame side-frame" style={{ visibility: 'hidden' }}>
            <div className="image-wrapper" />
          </div>
        )}
      </div>
    </div>
  );
}
