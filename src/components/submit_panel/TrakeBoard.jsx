import '../../styles/SubmitBoard.css'

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
                            
                            return (
                                <div key={`video_${videoIndex}`} className="trake-video-row">
                                    <div className="trake-video-name">
                                        <span className="video-text">{video_name}</span>
                                    </div>
                                    <div className="trake-frames-list">
                                        {frames.map((frameIdx, frameIndex) => (
                                            <div key={`frame_${frameIdx}`} className="trake-frame-item">
                                                <span className="frame-text">{frameIdx}</span>
                                                <button 
                                                    className="remove-frame-btn"
                                                    onClick={() => removeFrameFromGroup(videoIndex, frameIdx)}
                                                    title="Remove this frame"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="trake-actions">
                                        <button 
                                            className="remove-video-btn"
                                            onClick={() => removeVideoGroup(videoIndex)}
                                            title="Remove entire video group"
                                        >
                                            Remove Group
                                        </button>
                                    </div>
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
