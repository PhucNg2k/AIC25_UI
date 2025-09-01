import { useState } from 'react'
import VideoResultRow from '../video_player/VideoResultRow'
import FrameComponent from '../frame/FrameComponent'
import ResultsHeader from './ResultsHeader'
import '../../styles/ResultsPanel.css'

function ResultsPanel({ 
  searchResults, 
  setSearchResults,
  videoMetadata, 
  onOpenVideoPlayer, 
  onOpenFrameModal, 
  currentFramesList,
  onSubmitFrame,
  onOpenSliderModal
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

  function reparse_from_group(groupedResults) {
    let results = [];
    
    // Iterate through each video group
    Object.entries(groupedResults).forEach(([videoName, frames]) => {
      // Add each frame from this video group to the results array
      frames.forEach(frame => {
        results.push(frame);
      });
    });
    
    return results;
  }

  const handleDeleteVideo = (videoName) => {
    // Remove the video from groupedResults
    const updatedGroupedResults = { ...groupedResults };
    delete updatedGroupedResults[videoName];
    
    // Convert back to flat array and re-sort by score to maintain correct ranking
    const results = reparse_from_group(updatedGroupedResults);
    const sortedResults = results.sort((a, b) => b.score - a.score);
    setSearchResults(sortedResults);
  }
  

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
          <div key={`ranking_${result.video_name}_${result.frame_idx}_${index}`} className="ranking-frame-wrapper">
            <FrameComponent
              frameData={result}
              videoMetadata={videoMetadata}
              onOpenVideoPlayer={onOpenVideoPlayer}
              onOpenFrameModal={onOpenFrameModal}
              currentFramesList={currentFramesList}
              onSubmitFrame={onSubmitFrame}
              displayMode={displayMode}
              onOpenSliderModal={onOpenSliderModal}
            />
          </div>
        ))}
      </div>
    )
  }
  const groupedResults = searchResults.length > 0 ? groupResultsByVideo(searchResults) : {}
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
        onOpenSliderModal={onOpenSliderModal}
        onDeleteVideo={handleDeleteVideo}
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
