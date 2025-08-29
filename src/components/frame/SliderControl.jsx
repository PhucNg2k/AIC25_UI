export default function SliderControl({ relatedFrames, currentIndex, onIndexChange }) {
  

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
      </div>
    </div>
  )
}
