import { getMetadataKey, getFrameIdx, getVideoFPS, getPTStime, getVideoDuration } from '../../utils/metadata'
import FrameHeader from './FrameHeader'
import FrameControls from './FrameControls'
import '../../styles/FrameComponent.css'

import { useState, useRef, useEffect } from 'react'

function FrameComponent({
  frameData,
  onOpenVideoPlayer,
  onOpenFrameModal,
  currentFramesList,
  isHighlighted = false,
  onSubmitFrame,
  displayMode,
  onOpenSliderModal
}) {
  const { video_name, frame_idx, image_path, score } = frameData

  const metaKey = getMetadataKey(video_name, frame_idx)
  const targetFrame = getFrameIdx(metaKey)
  const vidFps = getVideoFPS(metaKey)
  const targetTime = getPTStime(metaKey)

  // Calculate approximate timestamp 
  const frameNumber = parseInt(targetFrame)
  const timestamp = targetTime;


  const BASE_DATA_PATH = "/REAL_DATA/Data"
  const videoUrl = `${BASE_DATA_PATH}/video/${video_name}.mp4`

  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef(null)
  const hoverTimer = useRef(null)
  const [isVideoAvailable, setIsVideoAvailable] = useState(true)

  const videoDuration = getVideoDuration(video_name); 
  const timeDelta = 1;
  const previewStart = Math.max(0, targetTime - timeDelta)
  const previewEnd = videoDuration ? Math.min(videoDuration, targetTime + timeDelta) : targetTime + timeDelta + 1.5;

  const handleMouseEnter = () => {
    // Start a timer to preload video after 300ms
    hoverTimer.current = setTimeout(() => {
      setShowVideo(true)
    }, 300)
  }

  const handleMouseLeave = () => {
    // Cancel preload timer if user leaves early
    clearTimeout(hoverTimer.current)
    setShowVideo(false) // unmount video immediately
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime > previewEnd) {
      videoRef.current.pause()
    }
  }

  // When <video> mounts, set start time and play
  useEffect(() => {
    if (showVideo && videoRef.current) {
      const vid = videoRef.current
      vid.currentTime = previewStart
      vid.play()
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [showVideo, previewStart]);

  // Reset availability when the target video changes
  useEffect(() => {
    setIsVideoAvailable(true)
  }, [videoUrl])


  const handleViewFrame = () => {
    onOpenFrameModal(frameData)
  }

  const handleViewVideo = () => {
    // Find the current frame's position in the frames list
    const frameIndex = currentFramesList.findIndex(f => f.image_path === frameData.image_path)
    onOpenVideoPlayer(frameData, frameIndex >= 0 ? frameIndex : 0)
  }

  const handleSubmitFrame = () => {
    const currentFrameData = {
      video_name: video_name,
      frame_idx: frameNumber,
    }
    onSubmitFrame(currentFrameData);
  }



  return (
    <div className={`frame-component ${isHighlighted ? 'highlighted' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >

      <FrameHeader video_name={video_name} target_frame={targetFrame} timestamp={timestamp} />

      <div className="frame-image-container">
        {!showVideo || !isVideoAvailable ? (
          <img
            className="frame-image"
            src={image_path}
            alt={`Frame ${targetFrame} from ${video_name}`}
          />
        ) : (
          <video
            ref={videoRef}
            className="frame-video-preview"
            src={videoUrl}
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onError={() => setIsVideoAvailable(false)}
          />
        )}
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
  )
}

export default FrameComponent
