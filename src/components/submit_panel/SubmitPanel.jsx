import { useState } from "react"
import '../../styles/SubmitPanel.css'
import SubmitHeader from './SubmitHeader'
import SubmitBoard from './SubmitBoard'
import ExportButton from './ExportButton'

function SubmitPanel({ submittedFrames = [], onClearSubmissions }) {
    const [query, setQuery] = useState('')
    const [queryId, setQueryId] = useState('')

    return (
        <div className="submit-panel">
            <SubmitHeader query={query} setQuery={setQuery} queryId={queryId} setQueryId={setQueryId} />
            
            <div className="submit-content">
                <SubmitBoard submittedFrames={submittedFrames} />
                {submittedFrames.length > 0 && (
                    <div className="submit-actions">
                        <button 
                            className="clear-btn" 
                            onClick={onClearSubmissions}
                            title="Clear all submitted frames"
                        >
                            Clear All
                        </button>
                        <ExportButton 
                            submittedFrames={submittedFrames}
                            query={query}
                            queryId={queryId}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default SubmitPanel
