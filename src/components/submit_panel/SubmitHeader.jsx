import { useState } from "react"
import '../../styles/SubmitHeader.css'

function SubmitHeader({ query, setQuery, queryId, setQueryId, setQueryTask, queryTask, submitType, setSubmitType, submittedFramesCount = 0, onClearSubmissions }) {
    const [inputValue, setInputValue] = useState('')
    const [queryIdInput, setQueryIdInput] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)

    const handleEdit = () => {
        setInputValue(query || '')
        setQueryIdInput(queryId || '')
        setIsEditing(true)
        setSelectedFile(null)
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (file && file.type === 'text/plain') {
            setSelectedFile(file)
            
            // Extract filename without extension for query ID
            const filename = file.name
            const lastDot = filename.lastIndexOf('.')
            const queryIdFromFile = lastDot > 0 ? filename.slice(0, lastDot) : filename
            setQueryIdInput(queryIdFromFile)
            
            // Parse file content for query
            const reader = new FileReader()
            reader.onload = (e) => {
                const content = e.target.result
                setInputValue(content.trim())
            }
            reader.readAsText(file)
            
            // Determine task from the last token
            const parts = queryIdFromFile.split(/[-\s_]+/).filter(Boolean)
            const lastToken = parts.length > 0 ? parts[parts.length - 1].toLowerCase() : ''
            if (['kis', 'qa', 'trake'].includes(lastToken)) {
                setQueryTask(lastToken)
            }
        } else {
            alert('Please select a valid text file (.txt)')
        }
    }

    const handleSave = () => {
        const q = inputValue.trim()
        let qidRaw = queryIdInput.trim()
        setQuery(q)

        // Sanitize: strip any extension only (e.g., .csv, .txt)
        const lastDot = qidRaw.lastIndexOf('.')
        if (lastDot > 0) {
            qidRaw = qidRaw.slice(0, lastDot)
        }

        // Determine task from the last token
        const parts = qidRaw.split(/[-\s_]+/).filter(Boolean)
        const lastToken = parts.length > 0 ? parts[parts.length - 1].toLowerCase() : ''
        if (['kis', 'qa', 'trake'].includes(lastToken)) {
            setQueryTask(lastToken);
            if (lastToken === 'trake' ) {
                setSubmitType('manual');
            }
        }

        setQueryId(qidRaw)
        setIsEditing(false)
        setSelectedFile(null)
    }

    const handleCancel = () => {
        setInputValue('')
        setQueryIdInput('')
        setIsEditing(false)
        setSelectedFile(null)
    }

    const getCounterClass = () => {
        if (submittedFramesCount >= 100) return 'counter-max'
        if (submittedFramesCount >= 80) return 'counter-warning'
        return 'counter-normal'
    }

    const handleTaskSwitch = (newTask) => {
        // Clear all submitted frames when switching tasks
        onClearSubmissions();
        setQueryTask(newTask);
    }

    const lockManual = (taskName) => {
        setSubmitType('manual');
        handleTaskSwitch(taskName);
    }

    return (
        <div className="submit-header">
            <div className="header-top">
                <h3>Submitted Frames</h3>
                <div className={`frame-counter ${getCounterClass()}`}>
                    {submittedFramesCount}/100
                </div>
            </div>

            <div className="submit-option">
                <button 
                    className={`submit-option-btn ${queryTask === 'kis' ? 'active' : ''}`} 
                    onClick={() => handleTaskSwitch('kis')}
                >
                    KIS
                </button>
                <button 
                    className={`submit-option-btn ${queryTask === 'qa' ? 'active' : ''}`} 
                    onClick={() => handleTaskSwitch('qa')}
                >
                    QA
                </button>
                <button 
                    className={`submit-option-btn ${queryTask === 'trake' ? 'active' : ''}`} 
                    onClick={() => lockManual('trake')}
                >
                    TRAKE
                </button>
            </div>

            <div className="submit-mode">
                <span className="mode-label">Mode:</span>
                <div className="mode-buttons">
                    <button
                        className={`mode-btn ${submitType === 'manual' ? 'active' : ''}`}
                        onClick={() => setSubmitType('manual')}
                        title="Manual submit mode"
                    >
                        Manual
                    </button>
                    {queryTask !== 'trake' &&
                        <button
                            className={`mode-btn ${submitType === 'auto' ? 'active' : ''}`}
                            onClick={() => setSubmitType('auto')}
                            title="Auto submit mode"
                        >
                            Auto
                        </button>
                    }
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
                            <div className="file-upload-container">
                                <input 
                                    id="submit-query-id"
                                    type="file"
                                    accept=".txt"
                                    onChange={handleFileUpload}
                                    className="file-input"
                                />
                                <label htmlFor="submit-query-id" className="file-upload-label">
                                    {selectedFile ? selectedFile.name : "Choose a .txt file"}
                                </label>
                                {selectedFile && (
                                    <span className="file-info">
                                        ✓ {selectedFile.name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="input-field">
                            <label htmlFor="submit-query">Query:</label>
                            <textarea 
                                id="submit-query"
                                placeholder="Query content will be auto-filled from uploaded file..."
                                value={inputValue}
                                className="query-textarea"
                                rows={3}
                                readOnly={selectedFile !== null}
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
