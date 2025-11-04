import { useState, useEffect, useRef } from "react";

export default function SliderControl({
  relatedFrames,
  currentIndex,
  onIndexChange,
  onSubmitFrame,
  submitMode,
  onClearSubmissions,
}) {
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [scanDirection, setScanDirection] = useState(1); // 1 for right, -1 for left
  const autoScanIntervalRef = useRef(null);

  // Auto-scan effect
  useEffect(() => {
    if (isAutoScanning) {
      autoScanIntervalRef.current = setInterval(() => {
        let newIndex = currentIndex + 1;

        // Check if we hit the end and need to restart from beginning
        if (newIndex >= relatedFrames.length) {
          newIndex = 0; // Restart from beginning
        }

        onIndexChange(newIndex);
      }, 50); // Move every 500ms
    } else {
      if (autoScanIntervalRef.current) {
        clearInterval(autoScanIntervalRef.current);
        autoScanIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (autoScanIntervalRef.current) {
        clearInterval(autoScanIntervalRef.current);
      }
    };
  }, [isAutoScanning, currentIndex, relatedFrames.length, onIndexChange]);

  const toggleAutoScan = () => {
    setIsAutoScanning(!isAutoScanning);
  };

  const handleSliderChange = (event) => {
    const newIndex = parseInt(event.target.value) - 1;
    if (newIndex >= 0 && newIndex < relatedFrames.length) {
      onIndexChange(newIndex);
    }
  };

  const handleSliderInput = (event) => {
    const newIndex = parseInt(event.target.value) - 1;
    if (newIndex >= 0 && newIndex < relatedFrames.length) {
      onIndexChange(newIndex);
    }
  };

  const handleSubmitFrames = () => {
    // Currently both manual and auto modes submit the current frame
    // Auto mode can be enhanced later to interpolate around current frame
    const currentFrameData = {
      video_name: relatedFrames[currentIndex].split("/")[1],
      frame_idx: parseInt(
        relatedFrames[currentIndex].split("/")[2].match(/f(\d+)\.webp/)[1],
        10
      ),
    };
    onSubmitFrame(currentFrameData);
  };

  const handleSubmitAllFrames = () => {
    if (onClearSubmissions) {
      // Clear first, then submit frames in the callback to ensure state is updated
      onClearSubmissions(() => {
        const allFramesData = relatedFrames.map((framePath) => {
          const parts = framePath.split("/");
          const video_name = parts[1];
          const frame_idx = parseInt(parts[2].match(/f(\d+)\.webp/)[1], 10);
          return { video_name, frame_idx, image_path: framePath };
        });

        // Submit each frame individually with isFrameset=true to bypass auto mode regeneration
        allFramesData.forEach((frameData) => {
          onSubmitFrame(frameData, true);
        });
      });
    }
  };

  return (
    <div className="slider-control">
      <div className="control-info">
        <span>
          Frame {currentIndex + 1} of {relatedFrames.length}
        </span>
      </div>

      <div className="control-placeholder">
        <div className="slidecontainer">
          <button
            className={`auto-scan-btn ${isAutoScanning ? "scanning" : ""}`}
            onClick={toggleAutoScan}
            title={
              isAutoScanning ? "Stop auto-scanning" : "Start auto-scanning"
            }
          >
            {isAutoScanning ? "⏸️ Stop" : "▶️ Auto-Scan"}
          </button>

          <input
            type="range"
            min="1"
            max={relatedFrames.length}
            value={currentIndex + 1}
            className="slider"
            id="controlSlider"
            onChange={handleSliderChange}
            onInput={handleSliderInput}
          />
        </div>

        <div className="submit-buttons">
          <button
            className="submit-frames-btn"
            onClick={handleSubmitFrames}
            disabled={isAutoScanning}
          >
            {submitMode === "manual"
              ? "Submit This Frame"
              : "Submit Moment From This Frame"}
          </button>

          {/* <button
            className="submit-all-frames-btn"
            onClick={handleSubmitAllFrames}
            disabled={isAutoScanning}
          >
            Submit Frameset
          </button> */}
        </div>
      </div>
    </div>
  );
}
