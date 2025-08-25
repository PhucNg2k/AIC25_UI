import { useState } from "react"
import '../../styles/SubmitHeader.css'

function SubmitHeader({ query, setQuery, queryId, setQueryId, submittedFramesCount = 0 }) {
    const [inputValue, setInputValue] = useState('')
    const [queryIdInput, setQueryIdInput] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    const handleEdit = () => {
        setInputValue(query || '')
        setQueryIdInput(queryId || '')
        setIsEditing(true)
    }

    const handleSave = () => {
        setQuery(inputValue.trim())
        // Process query_id: convert to integer and back to string to remove leading zeros
        const processedQueryId = queryIdInput.trim() ? parseInt(queryIdInput.trim(), 10).toString() : ''
        setQueryId(processedQueryId)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setInputValue('')
        setQueryIdInput('')
        setIsEditing(false)
    }

    const getCounterClass = () => {
        if (submittedFramesCount >= 100) return 'counter-max'
        if (submittedFramesCount >= 80) return 'counter-warning'
        return 'counter-normal'
    }

    return (
        <div className="submit-header">
            <div className="header-top">
                <h3>Submitted Frames</h3>
                <div className={`frame-counter ${getCounterClass()}`}>
                    {submittedFramesCount}/100
                </div>
            </div>
            <div className="query-input-group">
                {!isEditing ? (
                    // Display mode
                    <div className="query-display-container">
                        <div className="query-display-item">
                            <label>Query ID:</label>
                            <div className="query-display">
                                {queryId || "No query ID set"}
                            </div>
                        </div>
                        <div className="query-display-item">
                            <label>Query:</label>
                            <div className="query-display">
                                {query || "No query set"}
                            </div>
                        </div>
                        <button 
                            onClick={handleEdit}
                            className="edit-query-btn"
                        >
                            Edit
                        </button>
                    </div>
                ) : (
                    // Edit mode
                    <div className="query-edit-container">
                        <div className="input-field">
                            <label htmlFor="submit-query-id">Query ID:</label>
                            <input 
                                id="submit-query-id"
                                type="number"
                                placeholder="Enter query ID..."
                                value={queryIdInput}
                                onChange={(e) => setQueryIdInput(e.target.value)}
                                className="query-id-input"
                            />
                        </div>
                        <div className="input-field">
                            <label htmlFor="submit-query">Query:</label>
                            <textarea 
                                id="submit-query"
                                placeholder="Enter your query for these frames..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="query-textarea"
                                rows={3}
                            />
                        </div>
                        <div className="query-actions">
                            <button 
                                onClick={handleSave}
                                className="save-query-btn"
                                disabled={!inputValue.trim() || !queryIdInput.trim()}
                            >
                                Save
                            </button>
                            <button 
                                onClick={handleCancel}
                                className="cancel-query-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SubmitHeader
