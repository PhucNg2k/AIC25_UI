import { useState } from "react"
import '../../styles/SubmitHeader.css'

function SubmitHeader({ query, setQuery }) {
    const [inputValue, setInputValue] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    const handleEdit = () => {
        setInputValue(query || '')
        setIsEditing(true)
    }

    const handleSave = () => {
        setQuery(inputValue.trim())
        setIsEditing(false)
    }

    const handleCancel = () => {
        setInputValue('')
        setIsEditing(false)
    }

    return (
        <div className="submit-header">
            <h3>Submitted Frames</h3>
            <div className="query-input-group">
                <label htmlFor="submit-query">Query:</label>
                
                {!isEditing ? (
                    // Display mode
                    <div className="query-display-container">
                        <div className="query-display">
                            {query || "No query set. Click Edit to add a query."}
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
                        <textarea 
                            id="submit-query"
                            placeholder="Enter your query for these frames..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="query-textarea"
                            rows={3}
                            autoFocus
                        />
                        <div className="query-actions">
                            <button 
                                onClick={handleSave}
                                className="save-query-btn"
                                disabled={!inputValue.trim()}
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
