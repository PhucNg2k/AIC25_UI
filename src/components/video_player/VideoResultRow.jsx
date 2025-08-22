import FrameComponent from '../frame/FrameComponent'
import '../../styles/VideoResultRow.css'

function VideoResultRow({ 
  videoName, 
  frames, 
  videoMetadata, 
  onOpenVideoPlayer, 
  onOpenFrameModal, 
  currentFramesList 
}) {
  return (
    <div className="video-result-row">
      <div className="video-header">
        <h3 className="video-title">{videoName}</h3>
        <span className="frame-count">{frames.length} frame{frames.length > 1 ? 's' : ''}</span>
      </div>
      <div className="frames-container">
        {frames.map((frame, index) => (
          <FrameComponent
            key={`${frame.video_name}_${frame.frame_idx}`}
            frameData={frame}
            videoMetadata={videoMetadata}
            onOpenVideoPlayer={onOpenVideoPlayer}
            onOpenFrameModal={onOpenFrameModal}
            currentFramesList={currentFramesList}
          />
        ))}
      </div>
    </div>
  )
}

export default VideoResultRow
