import FrameComponent from '../frame/FrameComponent'
import '../../styles/VideoResultRow.css'

function VideoResultRow({ 
  videoName, 
  frames, 
  videoMetadata, 
  onOpenVideoPlayer, 
  onOpenFrameModal, 
  currentFramesList,
  onSubmitFrame,
  displayMode,
  onOpenSliderModal
}) {
  // Sort frames by frame_idx in ascending order
  const sortedFrames = [...frames].sort((a, b) => parseInt(a.frame_idx) - parseInt(b.frame_idx))
  
  // Find the frame with the highest similarity score
  const highestScoreFrame = frames.reduce((max, frame) => 
    frame.score > max.score ? frame : max, frames[0]
  )

  return (
    <div className="video-result-row">
      <div className="video-header">
        <h3 className="video-title">{videoName}</h3>
        <span className="frame-count">{frames.length} frame{frames.length > 1 ? 's' : ''}</span>
      </div>
      <div className="frames-container">
        {sortedFrames.map((frame, index) => (
          <FrameComponent
            key={`grouped_${frame.video_name}_${frame.frame_idx}_${index}`}
            frameData={frame}
            videoMetadata={videoMetadata}
            onOpenVideoPlayer={onOpenVideoPlayer}
            onOpenFrameModal={onOpenFrameModal}
            currentFramesList={currentFramesList}
            onSubmitFrame={onSubmitFrame}
            isHighlighted={frame.image_path === highestScoreFrame.image_path}
            displayMode={displayMode}
            onOpenSliderModal={onOpenSliderModal}
          />
        ))}
      </div>
    </div>
  )
}

export default VideoResultRow
