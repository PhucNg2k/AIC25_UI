import { useState } from 'react'
import '../../styles/SearchControls.css'

function SearchControls({ 
  searchData,
  onSearch,
  onClear, 
  isLoading
}) {
  const [localMaxResults, setLocalMaxResults] = useState(100)

  const hasValidSearchData = () => {
    return Object.values(searchData).some(typeData => 
      typeData && typeData.value && typeData.value.trim()
    )
  }

  const handleSearch = () => {
    if (hasValidSearchData()) {
      // Call the search function from parent with searchData and maxResults
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
            <option value="150">150</option>
            <option value="200">200</option>
            <option value="300">300</option>
          </select>
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
