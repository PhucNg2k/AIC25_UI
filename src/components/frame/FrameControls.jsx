import { get_related_keyframe } from "../../utils/frame_submission";

export default function FrameControls({
  onSubmitFrame,// event handler
  onViewFrame, // event handler
  onViewVideo, // event handler
  displayMode,
  image_path,
  onOpenSliderModal, // event handler
}) {
  const openSliderModal = () => {
    // image_path, step=null, sorted=false
    const frames = get_related_keyframe(image_path, null, false); // grouped keyframes, no sort
    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      console.error("FrameControls: get_related_keyframe returned null or empty", { image_path, frames });
      alert("No frames available for this image. The metadata may not be loaded yet.");
      return;
    }
    onOpenSliderModal(frames, image_path);
  };

  const handleFullview = () => {
    onViewFrame();
  };

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

        {displayMode ? (
          <button
            className="view-video-btn"
            title="View shot in video"
            onClick={onViewVideo}
          >
            🎬
          </button>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
