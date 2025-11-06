import { useState, useEffect } from "react";
import FrameSlider from "./FrameSlider";
import SliderControl from "./SliderControl";
import "../../styles/FrameSliderModal.css";

export default function FrameSliderModal({
  isOpen,
  onClose,
  relatedFrames,
  currentIndex,
  onSubmitFrame,
  submitMode,
  onClearSubmissions,
}) {
  const [currentSliderIndex, setCurrentSliderIndex] = useState(currentIndex);

  // Reset index when frames change
  useEffect(() => {
    setCurrentSliderIndex(currentIndex);
  }, [currentIndex]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const image_path = relatedFrames[currentSliderIndex];
  const parts = image_path.split("/");
  const frame_id = parts[parts.length - 1]; // f007932.webp
  const video_name = parts[parts.length - 2]; // L28_V023
  const key_name = parts[parts.length - 3]; // Videos_L28_a

  const match = frame_id.match(/f(\d+)\.webp/);
  const frameNumber = parseInt(match[1], 10);

  return (
    <div className="frame-slider-modal-overlay">
      <div className="frame-slider-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="key-video-info">
            <h3>{`${key_name}/${video_name}/${frame_id}`}</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <FrameSlider
            frames={relatedFrames}
            currentIndex={currentSliderIndex}
            onIndexChange={setCurrentSliderIndex}
          />

          <SliderControl
            relatedFrames={relatedFrames}
            currentIndex={currentSliderIndex}
            onIndexChange={setCurrentSliderIndex}
            onSubmitFrame={onSubmitFrame}
            submitMode={submitMode}
            onClearSubmissions={onClearSubmissions}
          />
        </div>
      </div>
    </div>
  );
}
