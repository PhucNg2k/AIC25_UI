import { useEffect, useRef, useState } from 'react'
import '../../styles/SearchModal.css'

function ImageSearchModal({ updateInput, type = 'img', title, description, resetTrigger }) {
  const [fileName, setFileName] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const fileInputRef = useRef(null)
  const lastUrlRef = useRef("")

  // Reset state on resetTrigger
  useEffect(() => {
    if (resetTrigger > 0) {
      // Clear preview first, then revoke previously stored URL to avoid race with <img>
      setPreviewUrl("")
      setFileName("")
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
    
    setFileName(file.name)
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current)
    lastUrlRef.current = localUrl
    updateInput(type, { file })
  }

  const handleClearImage = () => {
    setPreviewUrl("")
    setFileName("")
    updateInput(type, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (lastUrlRef.current) {
      URL.revokeObjectURL(lastUrlRef.current)
      lastUrlRef.current = ""
    }
  }

  return (
    <div className="search-modal">
      <div className="search-header">
        <h2>{title}</h2>
        <p>{description}</p>
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
      </div>
    </div>
  )
}

export default ImageSearchModal


