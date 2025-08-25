import { useState } from "react"
import '../../styles/ExportButton.css'
import SubmitPreview from './SubmitPreview'

function ExportButton({ submittedFrames, query, queryId }) {
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

        if (!queryId || queryId.trim() === '') {
            alert('Please set a query ID before exporting.')
            return
        }

        setIsExporting(true)

        try {
            // Convert submittedFrames to the expected format
            const frameNames = submittedFrames.map(frame => `${frame.video_name}_${frame.frame_idx}`);
            
            // Prepare data for CSV export
            const exportData = {
                query_id: parseInt(queryId, 10),
                query_str: query.trim(),
                selected_frames: frameNames
            }

            console.log('Prepared export data:', exportData)

            // Make POST request to the API
            const response = await fetch('http://localhost:8000/submitCSV/kis', {
                method: 'POST',
                headers: { 
                    'accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(exportData)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
            }

            const result = await response.json()
            console.log('Export successful:', result)
            
            alert(`✅ Export successful!\n\nCSV file: ${result.csv_file}\nTotal frames: ${result.total_frames}\nQuery ID: ${result.query_id}`)

        } catch (error) {
            console.error('Export failed:', error)
            
            // Handle specific error messages
            if (error.message.includes('409') || error.message.includes('already exists')) {
                alert(`❌ Export failed!\n\nQuery ID ${queryId} already exists. Please use a different Query ID.`)
            } else if (error.message.includes('Failed to fetch')) {
                alert('❌ Export failed!\n\nUnable to connect to the server. Please make sure the API is running on http://localhost:8000')
            } else {
                alert(`❌ Export failed!\n\n${error.message}`)
            }
        } finally {
            setIsExporting(false)
        }
    }

    const isDisabled = !submittedFrames || submittedFrames.length === 0 || !query?.trim() || !queryId?.trim()

    return (
        <div className="export-button-container">
            <button 
                className={`export-btn ${isDisabled ? 'disabled' : ''}`}
                onClick={handleExport}
                disabled={isDisabled || isExporting}
                title={isDisabled ? 'Add frames, set query ID and query to export' : 'Export to CSV'}
            >
                <span className="export-icon">📊</span>
                {isExporting ? 'Preparing Export...' : 'Export CSV'}
            </button>
            
            <SubmitPreview submittedFrames={submittedFrames} />
        </div>
    )
}

export default ExportButton
