import { useState, useEffect, useRef } from 'react'
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
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)

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

  const handleFocus = () => {
    setIsFocused(true)
    // Focus the textarea after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 0)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleClear = () => {
    setInputValue("")
    updateInput(type, null)
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
          
          {!isFocused ? (
            // Display mode - show full content in a div
            <div 
              className="search-display"
              onClick={handleFocus}
            >
              {inputValue || placeholder}
            </div>
          ) : (
            // Edit mode - normal textarea
            <textarea 
              ref={textareaRef}
              id={`search-input-${type}`}
              placeholder={placeholder}
              autoComplete="off"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              rows={3}
              className="search-textarea"
            />
          )}
          {inputValue ? (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClear}
                style={{ padding: '4px 8px', fontSize: 12 }}
              >
                Remove
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default SearchModal
