import { getMetadataKey, getFrameIdx, getVideoFPS } from '../../utils/metadata'
import '../../styles/FrameComponent.css'

function FrameComponent({ 
  frameData, 
  videoMetadata, 
  onOpenVideoPlayer, 
  onOpenFrameModal, 
  currentFramesList 
}) {
  const { video_name, frame_idx, image_path, score } = frameData

  const metaKey = getMetadataKey(video_name, frame_idx)
  const targetFrame = getFrameIdx(metaKey)
  const vidFps = getVideoFPS(metaKey)

  // Calculate approximate timestamp 
  const frameNumber = parseInt(targetFrame)
  const seconds = Math.floor(frameNumber / vidFps)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const timestamp = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`

  const handleViewFrame = () => {
    onOpenFrameModal(frameData)
  }

  const handleViewVideo = () => {
    // Find the current frame's position in the frames list
    const frameIndex = currentFramesList.findIndex(f => f.image_path === frameData.image_path)
    onOpenVideoPlayer(frameData, frameIndex >= 0 ? frameIndex : 0)
  }

  return (
    <div className="frame-component" id={metaKey}>
      <div className="frame-image-container">
        <img 
          className="frame-image" 
          src={image_path} 
          alt={`Frame ${targetFrame} from ${video_name}`}
        />
        <div className="frame-overlay">
          <div className="frame-info">
            <span className="frame-index">Frame #{targetFrame}</span>
            <span className="similarity-score">{score.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      <div className="frame-details">
        <div className="frame-timestamp">{timestamp}</div>
        <button 
          className="view-frame-btn" 
          title="View full size"
          onClick={handleViewFrame}
        >
          👁️
        </button>
        <button 
          className="view-video-btn" 
          title="View shot in video"
          onClick={handleViewVideo}
        >
          🎬
        </button>
      </div>
    </div>
  )
}

export default FrameComponent
