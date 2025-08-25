import { useState } from 'react'
import VideoResultRow from './video_player/VideoResultRow'
import FrameComponent from './frame/FrameComponent'
import ResultsHeader from './ResultsHeader'
import '../styles/ResultsPanel.css'

function ResultsPanel({ 
  searchQuery, 
  searchResults, 
  videoMetadata, 
  onOpenVideoPlayer, 
  onOpenFrameModal, 
  currentFramesList 
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
    if (searchQuery && searchResults.length === 0) {
      return (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No results found</h3>
          <p>Try different keywords or search terms</p>
        </div>
      )
    }
    
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
            <div className="ranking-number">#{index + 1}</div>
            <FrameComponent
              frameData={result}
              videoMetadata={videoMetadata}
              onOpenVideoPlayer={onOpenVideoPlayer}
              onOpenFrameModal={onOpenFrameModal}
              currentFramesList={currentFramesList}
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
      />
    ))
  }

  return (
    <div className="results-panel">
      <ResultsHeader 
        searchQuery={searchQuery}
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
