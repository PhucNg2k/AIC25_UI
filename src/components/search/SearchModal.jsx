import { useState, useEffect, useRef } from 'react'
import '../../styles/SearchModal.css'

function SearchModal({ 
  updateInput,
  type,
  title,
  description,
  placeholder,
  resetTrigger,
  defaultWeightValue,
  initialValue = ""
}) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [weightValue, setWeightValue] = useState(defaultWeightValue)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)

  // Reset input when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) { // Only trigger on actual reset, not initial load
      setInputValue("")
      setWeightValue("1")
      // Only clear once per resetTrigger bump to avoid loops
      updateInput(type, null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger, type])

  useEffect(() => {
    setInputValue(initialValue || "")
  }, [initialValue])

  useEffect(() => {
    if (typeof defaultWeightValue !== 'undefined') {
      setWeightValue(defaultWeightValue)
    }
  }, [defaultWeightValue])

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)
    
    // Always call updateInput, let SearchPanel decide what to do
    updateInput(type, { value: value, weight: Number(weightValue) || 1 })
  }

  const handleWeightChange = (e) => {
    const raw = e.target.value
    setWeightValue(raw)
    const numeric = Number(raw)
    if (inputValue && inputValue.trim()) {
      updateInput(type, { value: inputValue, weight: Number.isFinite(numeric) ? numeric : 1 })
    }
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
    setWeightValue("1")
    updateInput(type, null)
  }

  const hasValue = !!(inputValue && inputValue.trim());
  return (
    <div className={`search-modal ${hasValue ? '' : 'dimmed'}`}>
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

        <div className="search-input-group" style={{ marginTop: 12 }}>
          <label htmlFor={`weight-input-${type}`}>Weight (0–1)</label>
          <input
            id={`weight-input-${type}`}
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={weightValue}
            onChange={handleWeightChange}
          />
        </div>
      </div>
    </div>
  )
}

export default SearchModal
