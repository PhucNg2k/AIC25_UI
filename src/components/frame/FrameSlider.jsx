import KeyframePreview from './KeyframePreview';

export default function FrameSlider({ frames, currentIndex, onIndexChange }) {
  if (!frames || frames.length === 0) {
    return <div className="no-frames">No keyframes available</div>
  }

  const BASE_DATA_PATH = "/REAL_DATA/keyframes_b1/keyframes"
  const currentFrame = frames[currentIndex]
  const image_src = `${BASE_DATA_PATH}/${currentFrame}`;
  console.log(image_src)

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < frames.length - 1) {
      onIndexChange(currentIndex + 1)
    }
  }

  return (
    <div className="frame-slider">
      <div className="slider-navigation">

        <button 
          className="nav-btn prev-btn" 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          ‹
        </button>
        
        <KeyframePreview 
          relatedFrames={frames}
          currentIndex={currentIndex}
        />
        
        <button 
          className="nav-btn next-btn" 
          onClick={handleNext}
          disabled={currentIndex === frames.length - 1}
        >
          ›
        </button>
      </div>
    </div>
  )
}
