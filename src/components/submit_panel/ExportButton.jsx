import { useState } from "react"
import '../../styles/ExportButton.css'

function ExportButton({ submittedFrames, query }) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        // Prevent multiple exports
        if (isExporting) return

        // Check if there's data to export
        if (!submittedFrames || submittedFrames.length === 0) {
            alert('No frames to export. Please submit some frames first.')
            return
        }

        if (!query || query.trim() === '') {
            alert('Please set a query before exporting.')
            return
        }

        setIsExporting(true)

        try {
            // Prepare data for CSV export
            const exportData = {
                query: query.trim(),
                frames: submittedFrames,
                timestamp: new Date().toISOString(),
                frameCount: submittedFrames.length
            }

            console.log('Prepared export data:', exportData)

            // TODO: Replace with actual API call
            // const response = await fetch('/api/export-csv', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(exportData)
            // })

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            // TODO: Handle actual response
            console.log('Export would be successful')
            alert(`Ready to export ${submittedFrames.length} frames for query: "${query}"`)

        } catch (error) {
            console.error('Export preparation failed:', error)
            alert('Failed to prepare export. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    const generateFrameNames = () => {
        return submittedFrames.map(frame => `${frame.video_name}_${frame.frame_idx}`)
    }

    const getExportPreview = () => {
        if (!submittedFrames || submittedFrames.length === 0) return null
        
        const frameNames = generateFrameNames()
        return {
            query,
            frameCount: submittedFrames.length,
            firstFewFrames: frameNames.slice(0, 3),
            hasMore: frameNames.length > 3
        }
    }

    const preview = getExportPreview()
    const isDisabled = !submittedFrames || submittedFrames.length === 0 || !query?.trim()

    return (
        <div className="export-button-container">
            <button 
                className={`export-btn ${isDisabled ? 'disabled' : ''}`}
                onClick={handleExport}
                disabled={isDisabled || isExporting}
                title={isDisabled ? 'Add frames and set query to export' : 'Export to CSV'}
            >
                <span className="export-icon">📊</span>
                {isExporting ? 'Preparing Export...' : 'Export CSV'}
            </button>
            
            {preview && (
                <div className="export-preview">
                    <p className="preview-query">Query: "{preview.query}"</p>
                    <p className="preview-count">{preview.frameCount} frame{preview.frameCount !== 1 ? 's' : ''}</p>
                    {preview.firstFewFrames.length > 0 && (
                        <div className="preview-frames">
                            {preview.firstFewFrames.map((frameName, index) => (
                                <span key={index} className="preview-frame">{frameName}</span>
                            ))}
                            {preview.hasMore && <span className="preview-more">...</span>}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ExportButton
