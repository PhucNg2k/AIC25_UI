import { useEffect, useRef, useState } from 'react'
import { getMetadataKey, getFrameIdx, getVideoFPS, getPTStime } from '../../utils/metadata'
import '../../styles/VideoPlayerModal.css'
import VideoReactPlayer from './VideoReactPlayer'
import VideoNavigationButton from './VideoNavigationButton'

const BASE_DATA_PATH = "/REAL_DATA/Data"

function VideoPlayerModal({ 
  frameData, 
  currentIndex, 
  currentFramesList, 
  onClose, 
  onNavigate,
  onSubmitFrame
}) {
  const videoRef = useRef(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const { video_name, frame_idx, score } = frameData
  
  // Metadata key
  const metaKey = getMetadataKey(video_name, frame_idx)
  const vidFps = getVideoFPS(metaKey)
  const targetTime = getPTStime(metaKey)
  const currentFrameIdx = getFrameIdx(metaKey)

  const videoUrl = `${BASE_DATA_PATH}/video/${video_name}.mp4`


  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    

    const handleLoadedMetadata = () => {
      console.log(`Video ${video_name} metadata loaded, seeking to ${targetTime}`)
      video.currentTime = targetTime
    }

    const handleTimeUpdate = () => {
      const currentFrameNumber = Math.floor(video.currentTime * vidFps)
      setCurrentFrame(currentFrameNumber);
    }

    const handleError = (e) => {
      console.error('Video loading error:', e)
      alert(`Could not load video: ${BASE_DATA_PATH}/video/${video_name}.mp4\nMake sure the video file exists.`)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("error", handleError)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("error", handleError)
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [video_name, targetTime, vidFps])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSeekToFrame = () => {
    const video = videoRef.current
    if (video && targetTime>=0 && !isNaN(targetTime)) {
      console.log('Seeking to target time:', targetTime)
      video.currentTime = targetTime
      video.pause()
    } else {
      console.warn('Cannot seek - video ref or targetTime invalid:', video, targetTime)
    }
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  const handlePrevFrame = () => {
    onNavigate(-1)
    // Don't call onClose() - let VideoPlayerPanel handle the transition
  }

  const handleNextFrame = () => {
    onNavigate(1)
    // Don't call onClose() - let VideoPlayerPanel handle the transition
  }

  const canNavigatePrev = currentIndex > 0
  const canNavigateNext = currentIndex < currentFramesList.length - 1

  const handleSubmitFrame = () => {
  
    const video = videoRef.current
    if (video) {
      // Create frame data based on current video time
      const currentVideoTime = video.currentTime
      const currentFrameNumber = Math.floor(currentVideoTime * vidFps)
      
      // Create new frame data with current frame information
      const currentFrameData = {
        video_name: video_name,
        frame_idx: currentFrameNumber
      }
      
      onSubmitFrame(currentFrameData)
      
    }
  }

  return (
    <div className="video-player-modal" onClick={handleBackdropClick}>
      <div className="video-player-content" onClick={(e) => e.stopPropagation()}>
        <div className="video-player-header">
          <h3 className="video-player-title">
            {video_name} -  #{currentFrameIdx} ({currentIndex + 1}/{currentFramesList.length})
          </h3>
          <button className="close-player-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="video-player-container">
          <div className="video-player-panel">
            <VideoNavigationButton
              direction="prev"
              onClick={handlePrevFrame}
              disabled={!canNavigatePrev}
            />
            
            <video 
              ref={videoRef}
              key={`${video_name}_${frame_idx}`}
              className="video-element" 
              controls 
              preload="auto"
              src={videoUrl}
            >
              Your browser does not support the video tag.
            </video>
           
            <VideoNavigationButton
              direction="next"
              onClick={handleNextFrame}
              disabled={!canNavigateNext}
            />
          </div>
          
          <div className="video-player-info">
            <div className="frame-info-display">
              <span className="current-frame">Current Frame: <strong>{currentFrame}</strong></span>
              <span className="target-frame">Search Result Frame: <strong>{currentFrameIdx}</strong></span>
              <span className="similarity-display">Search Score: <strong>{score.toFixed(2)}%</strong></span>
            </div>
            
            <div className="video-controls-custom">
              <div className="controls-left">
                <button className="seek-to-frame-btn" onClick={handleSeekToFrame}>
                  🎯 Jump to Frame
                </button>
                <button className="play-pause-btn" onClick={handlePlayPause}>
                  ⏯️ {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
              
              <div className="controls-right">
                <button className="submit-frame-btn" onClick={handleSubmitFrame}>
                  📌 Submit Current Frame
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayerModal