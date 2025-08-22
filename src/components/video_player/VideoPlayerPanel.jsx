import { useState } from 'react'
import VideoPlayerModal from './VideoPlayerModal'

function VideoPlayerPanel({ 
  initialFrame, 
  videoMetadata, 
  framesList, 
  onClose,
  onSubmitFrame
}) {
  // Find the initial index of the frame in the framesList
  const initialIndex = framesList.findIndex(f => 
    f.video_name === initialFrame.video_name && f.frame_idx === initialFrame.frame_idx
  )
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0)

  const currentFrame = framesList[currentIndex]

  const handleNavigate = (direction) => {
    const newIndex = currentIndex + direction
    
    if (newIndex >= 0 && newIndex < framesList.length) {
      setCurrentIndex(newIndex)
    }
  }

  const handleClose = () => {
    onClose()
  }

  // If no current frame, close the panel
  if (!currentFrame) {
    handleClose()
    console.log('Close from currentFrame')
    return null
  }

  return (
    <VideoPlayerModal
      frameData={currentFrame}
      videoMetadata={videoMetadata}
      currentIndex={currentIndex}
      currentFramesList={framesList}
      onClose={handleClose}
      onNavigate={handleNavigate}
      onSubmitFrame={onSubmitFrame}
    />
  )
}

export default VideoPlayerPanel
