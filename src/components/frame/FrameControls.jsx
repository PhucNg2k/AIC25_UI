import {get_related_keyframe} from "../../utils/frame_submission"

export default function FrameControls({ onSubmitFrame, onViewFrame, onViewVideo, displayMode, image_path, onOpenSliderModal }) {
    
    const openSliderModal = () => {
        const frames = get_related_keyframe(image_path)
        onOpenSliderModal(frames, image_path)
    };

    const handleFullview = () => {
        onViewFrame();
    }

    return (
        <>
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
                    onClick={handleFullview}
                >
                    👁️
                </button>

                <button
                    className="view-frame-btn"
                    title="View keyframes slider"
                    onClick={openSliderModal}
                >
                    🖼️
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
        </>
    )
}


