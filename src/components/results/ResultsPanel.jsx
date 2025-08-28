import { useState } from 'react'
import VideoResultRow from '../video_player/VideoResultRow'
import FrameComponent from '../frame/FrameComponent'
import ResultsHeader from './ResultsHeader'
import '../../styles/ResultsPanel.css'

function ResultsPanel({ 
  searchResults, 
  videoMetadata, 
  onOpenVideoPlayer, 
  onOpenFrameModal, 
  currentFramesList,
  onSubmitFrame
}) {
  const [displayMode, setDisplayMode] = useState('grouped')
  
  // Group results by video name
  const groupResultsByVideo = (results) => {
    const grouped = {}
    
    results.forEach(result => {
      if (!grouped[result.video_name]) {
        grouped[result.video_name] = []
      }
      grouped[result.video_name].push(result)
    })
    
    return grouped
  }

  const groupedResults = searchResults.length > 0 ? groupResultsByVideo(searchResults) : {}

  const renderNoResults = () => {
    return (
      <div className="no-results">
        <div className="no-results-icon">📹</div>
        <h3>No search performed yet</h3>
        <p>Use the search panel on the left to find video frames</p>
      </div>
    )
  }

  const renderRankingDisplay = () => {
    return (
      <div className="ranking-grid">
        {searchResults.map((result, index) => (
          <div key={`${result.video_name}_${result.frame_idx}_${index}`} className="ranking-frame-wrapper">
            <FrameComponent
              frameData={result}
              videoMetadata={videoMetadata}
              onOpenVideoPlayer={onOpenVideoPlayer}
              onOpenFrameModal={onOpenFrameModal}
              currentFramesList={currentFramesList}
              onSubmitFrame={onSubmitFrame}
              displayMode={displayMode}
            />
          </div>
        ))}
      </div>
    )
  }

  const renderGroupedDisplay = () => {
    return Object.entries(groupedResults).map(([videoName, frames]) => (
      <VideoResultRow
        key={videoName}
        videoName={videoName}
        frames={frames}
        videoMetadata={videoMetadata}
        onOpenVideoPlayer={onOpenVideoPlayer}
        onOpenFrameModal={onOpenFrameModal}
        currentFramesList={currentFramesList}
        onSubmitFrame={onSubmitFrame}
        displayMode={displayMode}
      />
    ))
  }

  return (
    <div className="results-panel">
      <ResultsHeader 
        searchResults={searchResults}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
      />

      <div className="results-container">
        {searchResults.length > 0 ? (
          displayMode === 'grouped' ? renderGroupedDisplay() : renderRankingDisplay()
        ) : (
          renderNoResults()
        )}
      </div>
    </div>
  )
}

export default ResultsPanel
