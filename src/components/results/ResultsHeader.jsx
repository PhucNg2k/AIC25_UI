import { useState } from 'react'
import '../../styles/ResultsHeader.css'

function ResultsHeader({ searchResults, setSearchResults, displayMode, setDisplayMode }) {
  const [videoName, setVideoName] = useState('')

  const getSummaryText = () => {
    if (searchResults.length > 0) {
      return `Search results (${searchResults.length} frames found)`
    }
    return 'Enter a search query to see results'
  }
  
  const handleFetchByVideoName = async () => {
    if (!videoName.trim()) return
    try {
      const response = await fetch('http://localhost:8000/es-search/video_name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: videoName.trim().toUpperCase(), top_k: -1 })
      })
      const data = await response.json()
      
      console.log("DATA: ", data)

      if (data && Array.isArray(data.results)) {
        setSearchResults(data.results)
      }
    } catch (error) {
      console.error('Failed to fetch by video name:', error)
    }
    setVideoName('');
  }
  

  return (
    <div className="results-header">
      <div className="results-header-top">
        <h2>Search Results</h2>

        
        <div className="video-search-controls">
          <label htmlFor="videoNameInput">Video name</label>
          <input
            id="videoNameInput"
            type="text"
            value={videoName}
            onChange={(e) => setVideoName(e.target.value)}
            placeholder="Enter video name"
          />
          <button className="search-btn" onClick={handleFetchByVideoName}>Search</button>
        </div>

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
