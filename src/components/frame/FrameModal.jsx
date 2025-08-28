import { useEffect } from 'react'
import '../../styles/FrameModal.css'

function FrameModal({ frameData, onClose }) {
  const { image_path } = frameData

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="frame-modal" onClick={handleBackdropClick}>
      <img 
        src={image_path}
        alt="Full size frame"
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          borderRadius: '8px'
        }}
      />
    </div>
  )
}

export default FrameModal
