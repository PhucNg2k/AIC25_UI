import { useState, useEffect } from 'react'
import '../../styles/SearchModal.css'

function SearchModal({ 
  updateInput,
  type,
  title,
  description,
  placeholder,
  resetTrigger
}) {
  const [inputValue, setInputValue] = useState("")

  // Reset input when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) { // Only trigger on actual reset, not initial load
      setInputValue("")
      updateInput(type, null) // Remove the key from searchData when reset
    }
  }, [resetTrigger, type, updateInput]) // Now safe to include updateInput since it's memoized

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)
    
    // Always call updateInput, let SearchPanel decide what to do
    updateInput(type, { value: value })
  }

  return (
    <div className="search-modal">
      <div className="search-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      
      <div className="search-container">
        <div className="search-input-group">
          <label htmlFor={`search-input-${type}`}>Search Query</label>
          <input 
            type="text" 
            id={`search-input-${type}`}
            placeholder={placeholder}
            autoComplete="off"
            value={inputValue}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  )
}

export default SearchModal
