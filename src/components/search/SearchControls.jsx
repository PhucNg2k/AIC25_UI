import { useState } from 'react'
import { validateSearchData } from '../../utils/searching.js'
import '../../styles/SearchControls.css'

function SearchControls({ 
  searchData,
  onSearch,
  // updateInput is not used here but kept for future extension
  updateInput,
  onClear, 
  isLoading,
}) {
  const [localMaxResults, setLocalMaxResults] = useState(1000)

  const hasValidSearchData = () => {
    return validateSearchData(searchData)
  }

  const handleSearch = () => {
    if (hasValidSearchData()) {
      onSearch(searchData, localMaxResults)
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
            <option value="300">200</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
          </select>
        </div>
        
      </div>
      
      <div className="button-controls">
        <button 
          type="button" 
          className={`btn-primary ${!hasValidSearchData() ? 'btn-disabled' : ''}`}
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
