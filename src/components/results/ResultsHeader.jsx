import '../../styles/ResultsHeader.css'

function ResultsHeader({ searchResults, displayMode, setDisplayMode }) {
  const getSummaryText = () => {
    if (searchResults.length > 0) {
      return `Search results (${searchResults.length} frames found)`
    }
    return 'Enter a search query to see results'
  }

  return (
    <div className="results-header">
      <div className="results-header-top">
        <h2>Search Results</h2>
        
        {searchResults.length > 0 && (
          <div className="display-mode-toggle">
            <button 
              className={`mode-btn ${displayMode === 'grouped' ? 'active' : ''}`}
              onClick={() => setDisplayMode('grouped')}
              title="Group results by video"
            >
              📁 Grouped
            </button>
            <button 
              className={`mode-btn ${displayMode === 'ranking' ? 'active' : ''}`}
              onClick={() => setDisplayMode('ranking')}
              title="Show results by ranking"
            >
              📊 Ranking
            </button>
          </div>
        )}
      </div>
      
      <div className="results-summary">
        <span>{getSummaryText()}</span>
        {searchResults.length > 0 && (
          <span className="results-count">
            {searchResults.length} frame{searchResults.length !== 1 ? 's' : ''} found
          </span>
        )}
      </div>
    </div>
  )
}

export default ResultsHeader
