import VideoResultRow from './video_player/VideoResultRow'
import '../styles/ResultsPanel.css'

function ResultsPanel({ 
  searchQuery, 
  searchResults, 
  videoMetadata, 
  onOpenVideoPlayer, 
  onOpenFrameModal, 
  currentFramesList 
}) {
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

  const getSummaryText = () => {
    if (searchQuery && searchResults.length > 0) {
      return `Search results for "${searchQuery}"`
    } else if (searchQuery && searchResults.length === 0) {
      return `No results found for "${searchQuery}"`
    }
    return 'Enter a search query to see results'
  }

  return (
    <div className="results-panel">
      <div className="results-header">
        <h2>Search Results</h2>
        <div className="results-summary">
          <span>{getSummaryText()}</span>
        </div>
      </div>

      <div className="results-container">
        {searchResults.length > 0 ? (
          Object.entries(groupedResults).map(([videoName, frames]) => (
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
        ) : (
          renderNoResults()
        )}
      </div>
    </div>
  )
}

export default ResultsPanel
