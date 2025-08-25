import { useState } from 'react'
import '../styles/SearchPanel.css'

function SearchPanel({ 
  searchQuery, 
  setSearchQuery, 
  maxResults, 
  setMaxResults, 
  isLoading, 
  onSearch, 
  onClear, 
  resultCount 
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch()
    }
  }

  return (
    <div className="search-panel">
      <div className="search-header">
        <h2>xVibeAI IR System</h2>
        <p>Enter text to find similar video frames</p>
      </div>
      
      <div className="search-container">
        <div className="search-input-group">
          <label htmlFor="search-input">Search Query</label>
          <input 
            type="text" 
            id="search-input" 
            placeholder="e.g., people walking, night scene, ambulance car..."
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="search-controls">
          <button 
            type="button" 
            className="btn-primary"
            onClick={onSearch}
            disabled={isLoading}
          >
            <span className="btn-icon">🔍</span>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onClear}
            disabled={isLoading}
          >
            <span className="btn-icon">🗑️</span>
            Clear
          </button>
        </div>

        <div className="search-options">
          <div className="option-group">
            <label htmlFor="max-results">Max Results:</label>
            <select 
              id="max-results"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="60">60</option>
              <option value="80">80</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <div className="search-status">
        {isLoading && (
          <div className="loading">
            <div className="spinner"></div>
            <span>Searching...</span>
          </div>
        )}
        {!isLoading && resultCount > 0 && (
          <div className="search-info">
            <span>{resultCount} result{resultCount > 1 ? 's' : ''} found</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPanel
