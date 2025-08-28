export default function FrameControls({ onSubmitFrame, onViewFrame, onViewVideo, displayMode }) {
    return (
        <div className="frame-details">
            <button
                className="view-frame-btn"
                title="Submit this frame"
                onClick={onSubmitFrame}
            >
                ➕ Submit
            </button>

            <button
                className="view-frame-btn"
                title="View full size"
                onClick={onViewFrame}
            >
                👁️
            </button>

            { displayMode  ? (
                 <button
                 className="view-video-btn"
                 title="View shot in video"
                 onClick={onViewVideo}
             >
                 🎬
             </button>
            ) : (
                <>
                </>
            )}

           

            

        </div>
    )
}


