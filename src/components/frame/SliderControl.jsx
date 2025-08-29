export default function SliderControl({ relatedFrames, currentIndex, onIndexChange, onSubmitFrame, submitMode, onClearSubmissions }) {
  

  const handleSliderChange = (event) => {
    const newIndex = parseInt(event.target.value) - 1
    if (newIndex >= 0 && newIndex < relatedFrames.length) {
      onIndexChange(newIndex)
    }
  }

  const handleSliderInput = (event) => {
    const newIndex = parseInt(event.target.value) - 1
    if (newIndex >= 0 && newIndex < relatedFrames.length) {
      onIndexChange(newIndex)
    }
  }

  const handleSubmitFrames = () => {
    // Currently both manual and auto modes submit the current frame
    // Auto mode can be enhanced later to interpolate around current frame
    const currentFrameData = {
      video_name: relatedFrames[currentIndex].split("/")[1],
      frame_idx: parseInt(relatedFrames[currentIndex].split("/")[2].match(/f(\d+)\.webp/)[1], 10),
      image_path: relatedFrames[currentIndex]
    }
    onSubmitFrame(currentFrameData);
  }

  const handleSubmitAllFrames = () => {
    if (onClearSubmissions) {
      // Clear first, then submit frames in the callback to ensure state is updated
      onClearSubmissions(() => {
        const allFramesData = relatedFrames.map(framePath => {
          const parts = framePath.split("/");
          const video_name = parts[1];
          const frame_idx = parseInt(parts[2].match(/f(\d+)\.webp/)[1], 10);
          return { video_name, frame_idx, image_path: framePath };
        });
        
        // Submit each frame individually with isFrameset=true to bypass auto mode regeneration
        allFramesData.forEach(frameData => {
          onSubmitFrame(frameData, true);
        });
      });
    }
  }

  return (
    <div className="slider-control">
      <div className="control-info">
        <span>Frame {currentIndex + 1} of {relatedFrames.length}</span>
      </div>
      
      <div className="control-placeholder">
        <div className="slidecontainer">
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
          >
            {submitMode === 'manual' ? 'Submit This Frame' : 'Submit Moment From This Frame'}
          </button>
          
          <button 
            className="submit-all-frames-btn" 
            onClick={handleSubmitAllFrames}
          >
            Submit Frameset
          </button>
        </div>
      </div>
    </div>
  )
}
