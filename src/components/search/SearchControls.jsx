import { useState } from 'react'
import '../../styles/SearchControls.css'

function SearchControls({ 
  searchData,
  onSearch,
  // updateInput is not used here but kept for future extension
  updateInput,
  onClear, 
  isLoading
}) {
  const [localMaxResults, setLocalMaxResults] = useState(100)
  const [localIntersect, setLocalIntersect] = useState(false)

  const hasValidSearchData = () => Object.keys(searchData).length > 0

  const handleSearch = () => {
    if (hasValidSearchData()) {
      // Include intersect flag in the payload
      const payload = { ...searchData, intersect: localIntersect }
      onSearch(payload, localMaxResults)
    }
  }

  const handleClear = () => {
    onClear()
    // Keep current maxResults setting, don't reset it
  }

  return (
    <div className="search-controls">
      <div className="search-options">
        <div className="option-group">
          <label htmlFor="max-results">Max Results:</label>
          <select 
            id="max-results"
            value={localMaxResults}
            onChange={(e) => setLocalMaxResults(parseInt(e.target.value))}
            disabled={isLoading}
          >
            <option value="100">100</option>
            <option value="150">150</option>
            <option value="200">200</option>
            <option value="300">300</option>
          </select>
        </div>
        <div className="intersect-center-row">
          <button
            type="button"
            className={`btn-toggle-plain ${localIntersect ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLocalIntersect((v) => !v)}
            disabled={isLoading}
          >
            Intersect
          </button>
        </div>
      </div>
      
      <div className="button-controls">
        <button 
          type="button" 
          className="btn-primary"
          onClick={handleSearch}
          disabled={isLoading || !hasValidSearchData()}
        >
          <span className="btn-icon">🔍</span>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        <button 
          type="button" 
          className="btn-secondary"
          onClick={handleClear}
          disabled={isLoading}
        >
          <span className="btn-icon">🗑️</span>
          Clear
        </button>
      </div>
    </div>
  )
}

export default SearchControls
