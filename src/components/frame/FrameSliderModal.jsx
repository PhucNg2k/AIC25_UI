import { useState, useEffect } from 'react'
import FrameSlider from './FrameSlider'
import SliderControl from './SliderControl'
import '../../styles/FrameSliderModal.css'

export default function FrameSliderModal({ 
  isOpen, 
  onClose, 
  relatedFrames, 
  currentIndex = 0 
}) {
  const [currentSliderIndex, setCurrentSliderIndex] = useState(currentIndex)

  // Reset index when frames change
  useEffect(() => {
    setCurrentSliderIndex(currentIndex)
  }, [currentIndex])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const currentFrameData = relatedFrames[currentSliderIndex];
  const parts = currentFrameData.split("/");

  const frame_id = parts[parts.length - 1];           // f007932.webp
  const video_name = parts[parts.length - 2];         // L28_V023
  const key_name = parts[parts.length - 3];           // Videos_L28_a

  return (
    <div className="frame-slider-modal-overlay">
      <div className="frame-slider-modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <div className="key-video-info">
            <h3>{`${key_name}/${video_name}/${frame_id}`}</h3>
            
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
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
          />
        </div>
      </div>
    </div>
  )
}
