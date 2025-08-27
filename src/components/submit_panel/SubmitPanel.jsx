import '../../styles/SubmitPanel.css'
import SubmitHeader from './SubmitHeader'
import KISBoard from './KISboard'
import QABoard from './QABoard'
import TrakeBoard from './TrakeBoard'
import ExportButton from './ExportButton'

function SubmitPanel({ 
    query, 
    setQuery, 
    queryId, 
    setQueryId, 
    queryTask, 
    setQueryTask, 
    submittedFrames = [], 
    setSubmittedFrames, 
    onClearSubmissions 
}) {
    return (
        <div className="submit-panel">
            <SubmitHeader 
                query={query} 
                setQuery={setQuery} 
                queryId={queryId} 
                setQueryId={setQueryId} 
                setQueryTask={setQueryTask}
                queryTask={queryTask}
                submittedFramesCount={submittedFrames.length}
                onClearSubmissions={onClearSubmissions}
            />
            
            <div className="submit-content">
                {queryTask === 'kis' ? (
                    <KISBoard submitType={queryTask} submittedFrames={submittedFrames} setSubmittedFrames={setSubmittedFrames} />
                ) : queryTask === 'qa' ? (
                    <QABoard submitType={queryTask} submittedFrames={submittedFrames} setSubmittedFrames={setSubmittedFrames} />
                ) : queryTask === 'trake' ? (
                    <TrakeBoard submitType={queryTask} submittedFrames={submittedFrames} setSubmittedFrames={setSubmittedFrames} />
                ) : (
                    <KISBoard submitType={queryTask} submittedFrames={submittedFrames} setSubmittedFrames={setSubmittedFrames} />
                )}

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
                            queryTask={queryTask}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default SubmitPanel
