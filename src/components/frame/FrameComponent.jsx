import { getMetadataKey, getFrameIdx, getPTStime } from "../../utils/metadata";
import FrameHeader from "./FrameHeader";
import FrameControls from "./FrameControls";
import "../../styles/FrameComponent.css";

import { getWatchUrl } from "../../utils/videoIndex";

function FrameComponent({
  frameData, // an object with keys: frame-idx, video_name, pts_time, score, img_path
  onOpenVideoPlayer,
  onOpenFrameModal,
  currentFramesList,
  isHighlighted = false,
  onSubmitFrame,
  displayMode,
  onOpenSliderModal,
}) {
  const { video_name, frame_idx, image_path } = frameData;

  const metaKey = getMetadataKey(video_name, frame_idx);

  const targetFrame = getFrameIdx(metaKey);
  const targetTime = getPTStime(metaKey);

  // Calculate approximate timestamp
  const frameNumber = Number.isFinite(Number(targetFrame))
    ? Math.round(Number(targetFrame))
    : 0;

  const timestamp = targetTime;
  // Resolve watch URL from the video index (synchronous lookup)
  const watchUrl = getWatchUrl(video_name);

  const handleViewFrame = () => {
    onOpenFrameModal(frameData);
  };

  const handleViewVideo = () => {
    // Find the current frame's position in the frames list
    const frameIndex = currentFramesList.findIndex(
      (f) => f.image_path === frameData.image_path
    );
    onOpenVideoPlayer(frameData, frameIndex >= 0 ? frameIndex : 0);
  };

  const handleSubmitFrame = () => {
    const currentFrameData = {
      video_name: video_name,
      frame_idx: frameNumber,
    };
    onSubmitFrame(currentFrameData);
  };

  return (
    <div
      className={`frame-component ${isHighlighted ? "highlighted" : ""}`}
    >
      <FrameHeader
        video_name={video_name}
        target_frame={targetFrame}
        timestamp={timestamp}
      />

      <div className="frame-image-container">
        <img
          className="frame-image"
          src={image_path}
          alt={`Frame ${targetFrame} from ${video_name}`}
          title={watchUrl ? "Open video" : "No URL found"}
          onClick={handleViewVideo}
          style={{ cursor: "pointer" }}
        />
      </div>

      <FrameControls
        onSubmitFrame={handleSubmitFrame}
        onViewFrame={handleViewFrame}
        onViewVideo={handleViewVideo}
        displayMode={displayMode}
        image_path={image_path}
        onOpenSliderModal={onOpenSliderModal}
        targetFrame={targetFrame}
      />
    </div>
  );
}

export default FrameComponent;
