import '../../styles/SubmitBoard.css'
import { interpolate_trake_frames } from '../../utils/trake_frames.js'

function TrakeBoard({ submitType, submittedFrames, setSubmittedFrames }) {
    const removeFrameFromGroup = (videoIndex, frameToRemove) => {
        setSubmittedFrames(prev => {
            const newFrames = [...prev];
            const videoEntry = newFrames[videoIndex];
            
            if (videoEntry.frames.length === 1) {
                // Remove entire video entry if only one frame left
                return newFrames.filter((_, index) => index !== videoIndex);
            } else {
                // Remove specific frame from the group
                videoEntry.frames = videoEntry.frames.filter(frame => frame !== frameToRemove);
                return newFrames;
            }
        });
    };

    const removeVideoGroup = (videoIndex) => {
        setSubmittedFrames(prev => prev.filter((_, index) => index !== videoIndex));
    };

    const handleInterpolate = (videoIndex) => {
        const videoEntry = submittedFrames[videoIndex];
        if (!videoEntry || videoEntry.frames.length === 0) {
            alert('No frames to interpolate');
            return;
        }

        // Get the anchor frames (sorted in ascending order)
        const anchorFrames = [...videoEntry.frames].sort((a, b) => a - b);
        
        // Generate 100 interpolated frame combinations
        const interpolatedFrames = interpolate_trake_frames(anchorFrames);
        
        // Convert interpolated frames back to the TRAKE format
        const newTrakeList = interpolatedFrames.map((frameCombination) => ({
            video_name: videoEntry.video_name,
            frames: frameCombination
        }));

        // Replace the current video entry with all 100 combinations
        setSubmittedFrames(prev => {
            const newFrames = [...prev];
            newFrames[videoIndex] = newTrakeList[0]; // Keep the original anchor frames as first
            // Add the remaining 99 interpolated combinations
            newFrames.splice(videoIndex + 1, 0, ...newTrakeList.slice(1));
            return newFrames;
        });

        alert(`Generated ${interpolatedFrames.length} frame combinations for ${videoEntry.video_name}`);
    };

    return (
        <div className="submit-board">
            {submittedFrames.length === 0 ? (
                <div className="empty-state">
                    <p>No frame groups submitted yet</p>
                    <p className="hint">Enter a query above and submit frames from any video to build your collection</p>
                </div>
            ) : (
                <div className="trake-frames-container">
                    <div className="trake-header">
                        <div className="trake-header-video">Video Name</div>
                        <div className="trake-header-frames">Frame Indices</div>
                        <div className="trake-header-actions">Actions</div>
                    </div>
                    <div className="trake-frames-list">
                        {submittedFrames.map((videoEntry, videoIndex) => {
                            const { video_name, frames } = videoEntry;
                            const isFirstRow = videoIndex === 0;
                            
                            return (
                                <div key={`video_${videoIndex}`} className={`trake-video-row ${isFirstRow ? 'anchor-row' : 'interpolated-row'}`}>
                                    <div className="trake-video-name">
                                        <span className="video-text">{video_name}</span>
                                    </div>
                                    <div className="trake-frames-list">
                                        {frames.map((frameIdx, frameIndex) => (
                                            <div key={`frame_${frameIdx}`} className="trake-frame-item">
                                                <span className="frame-text">{frameIdx}</span>
                                                {isFirstRow && (
                                                    <button 
                                                        className="remove-frame-btn"
                                                        onClick={() => removeFrameFromGroup(videoIndex, frameIdx)}
                                                        title="Remove this frame"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {isFirstRow && (
                                        <div className="trake-actions">
                                            <button 
                                                className="interpolate-btn"
                                                onClick={() => handleInterpolate(videoIndex)}
                                                title="Generate interpolated frame combinations"
                                            >
                                                Interpolate
                                            </button>
                                            <button 
                                                className="remove-video-btn"
                                                onClick={() => removeVideoGroup(videoIndex)}
                                                title="Remove entire video group"
                                            >
                                                Remove Group
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TrakeBoard
