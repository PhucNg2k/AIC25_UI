import SearchModal from './SearchModal'
import SearchControls from './SearchControls'
import '../../styles/SearchPanel.css'
import { useState, useCallback } from 'react'

function SearchPanel({ 
  isLoading, 
  onSearch,
  onClear, 
  resultCount 
}) {
  const [searchData, setSearchData] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);

  const updateInput = useCallback((type, inputData) => {
    setSearchData(prev => {
      const newData = { ...prev };
      
      if (inputData === null) {
        // Remove the key if inputData is explicitly null (reset case)
        delete newData[type];
      } else if (inputData && inputData.value && inputData.value.trim()) {
        // Add or update the key if value is not empty
        newData[type] = inputData;
      } else if (prev[type]) {
        // Only remove the key if it existed before and now becomes empty
        delete newData[type];
      }
      // If key doesn't exist and value is empty, do nothing (don't create the key)
      
      return newData;
    });
  }, [])

  function handleClear() {
    setSearchData({});
    setResetTrigger(prev => prev + 1);
    onClear();
  }

  return (
    <div className="search-panel">
      {/* Text Search Modal */}
      <SearchModal
        updateInput={updateInput}
        type="text"
        title="Text Search"
        description="Enter text to find similar video frames"
        placeholder="e.g., a running horse"
        resetTrigger={resetTrigger}
      />
      
      {/* OCR Search Modal */}
      <SearchModal
        updateInput={updateInput}
        type="ocr"
        title="OCR Search"
        description="Search for text that appears in video frames"
        placeholder="e.g., green farm village"
        resetTrigger={resetTrigger}
      />
      
      {/* Localized Search Modal */}
      <SearchModal
        updateInput={updateInput}
        type="localized"
        title="Location Search"
        description="Search by location or place names"
        placeholder="e.g., vietnam"
        resetTrigger={resetTrigger}
      />
      
      {/* Search Controls */}
      <SearchControls
        searchData={searchData}
        onSearch={onSearch}
        onClear={handleClear}
        isLoading={isLoading}
      />

      {/* Debug - Current Search Data */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px', 
        marginTop: '20px',
        fontSize: '12px',
        color: '#6c757d'
      }}>
        <strong>Current Search Data:</strong>
        <pre>{JSON.stringify(searchData, null, 2)}</pre>
      </div>
    </div>
  )
}

export default SearchPanel
