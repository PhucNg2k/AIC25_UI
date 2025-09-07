import { useEffect, useRef, useState } from 'react'
import '../../styles/SearchModal.css'

function ImageSearchModal({ updateInput, type = 'img', title, description, resetTrigger, defaultWeightValue, initialFile = null }) {
  const [fileName, setFileName] = useState(initialFile ? (initialFile.name || "") : "")
  const [previewUrl, setPreviewUrl] = useState(initialFile ? URL.createObjectURL(initialFile) : "")
  const [weightValue, setWeightValue] = useState(defaultWeightValue)
  const fileInputRef = useRef(null)
  const currentFileRef = useRef(initialFile)
  const lastUrlRef = useRef("")

  // Reset state on resetTrigger
  useEffect(() => {
    if (resetTrigger > 0) {
      // Clear preview first, then revoke previously stored URL to avoid race with <img>
      setPreviewUrl("")
      setFileName("")
      setWeightValue("1")
      if (lastUrlRef.current) {
        URL.revokeObjectURL(lastUrlRef.current)
        lastUrlRef.current = ""
      }
      updateInput(type, null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [resetTrigger, type, updateInput])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (lastUrlRef.current) {
        URL.revokeObjectURL(lastUrlRef.current)
        lastUrlRef.current = ""
      }
    }
  }, [])

  useEffect(() => {
    if (initialFile) {
      currentFileRef.current = initialFile
      setFileName(initialFile.name || "")
      const url = URL.createObjectURL(initialFile)
      setPreviewUrl(url)
      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current)
      lastUrlRef.current = url
    } else {
      currentFileRef.current = null
      setFileName("")
      setPreviewUrl("")
      if (lastUrlRef.current) {
        URL.revokeObjectURL(lastUrlRef.current)
        lastUrlRef.current = ""
      }
    }
  }, [initialFile])

  useEffect(() => {
    if (typeof defaultWeightValue !== 'undefined') {
      setWeightValue(defaultWeightValue)
    }
  }, [defaultWeightValue])

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) {
      updateInput(type, null)
      setFileName("")
      setPreviewUrl("")
      if (lastUrlRef.current) {
        URL.revokeObjectURL(lastUrlRef.current)
        lastUrlRef.current = ""
      }
      return
    }
    
    currentFileRef.current = file
    setFileName(file.name)
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current)
    lastUrlRef.current = localUrl
    updateInput(type, { file, weight: Number(weightValue) || 1 })
  }

  const handleClearImage = () => {
    setPreviewUrl("")
    setFileName("")
    setWeightValue("1")
    updateInput(type, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (lastUrlRef.current) {
      URL.revokeObjectURL(lastUrlRef.current)
      lastUrlRef.current = ""
    }
  }

  const handleWeightChange = (e) => {
    const raw = e.target.value
    setWeightValue(raw)
    const numeric = Number(raw)
    // Only update if a file is present
    const fileInInput = fileInputRef.current?.files?.[0]
    const file = fileInInput || currentFileRef.current
    if (file) {
      updateInput(type, { file, weight: Number.isFinite(numeric) ? numeric : 1 })
    }
  }

  const hasImage = !!fileName;
  return (
    <div className={`search-modal ${hasImage ? '' : 'dimmed'}`}>
      <div className="search-header">
        <h2>{title}</h2>

      </div>

      <div className="search-container">
        { !previewUrl && (
            <div className="search-input-group">
              <label htmlFor="image-upload-input">Upload Image</label>
              <input id="image-upload-input" ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />
              {fileName ? (
                <div className="search-helper-text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ flex: '0 1 auto' }}>Selected: {fileName}</span>
                </div>
              ) : null}
            </div>
            )
        }
        {previewUrl ? (
          <div className="search-input-group">
            <label>Preview</label>
            <div>
              <div className="search-display" style={{ padding: 0 }}>
                <img 
                  src={previewUrl} 
                  alt="Selected preview" 
                  style={{ maxWidth: '100%', maxHeight: 240, display: 'block', borderRadius: 6 }} 
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={handleClearImage}
                  style={{ padding: '4px 8px', fontSize: 12 }}
                >
                  Remove image
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="search-input-group" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor={`weight-input-${type}`} style={{ marginBottom: 0, minWidth: 'auto' }}>Weight:</label>
          <input
            id={`weight-input-${type}`}
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={weightValue}
            onChange={handleWeightChange}
            style={{ width: '80px' }}
          />
        </div>
      </div>
    </div>
  )
}

export default ImageSearchModal


