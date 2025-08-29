import '../../styles/SubmitBoard.css'

function QABoard({ submitType, submittedFrames, setSubmittedFrames }) {
    // Get the answer from the first frame (or empty string if no frames)
    const firstAnswer = submittedFrames.length > 0 ? submittedFrames[0].answer || '' : '';
    
    const handleGlobalAnswerChange = (answer) => {
        // Update all frames with the same answer
        setSubmittedFrames(prev => 
            prev.map(frame => ({
                ...frame,
                answer: answer
            }))
        );
    }

    return (
        <div className="submit-board">
            {submittedFrames.length === 0 ? (
                <div className="empty-state">
                    <p>No frames submitted yet</p>
                    <p className="hint">Enter a query above and submit frames from any video to build your collection</p>
                </div>
            ) : (
                <div className="qa-frames-container">
                    <div className="qa-global-answer">
                        <label htmlFor="global-answer">Your answer</label>
                        <input
                            id="global-answer"
                            type="text"
                            value={firstAnswer}
                            onChange={(e) => handleGlobalAnswerChange(e.target.value)}
                            placeholder="Enter your answer"
                            className="global-answer-field"
                        />
                    </div>
                    <div className="qa-header">
                        <div className="qa-header-frame">Frame Name</div>
                        <div className="qa-header-answer">Answer</div>
                    </div>
                    <div className="qa-frames-list">
                        {submittedFrames.map((frameData, index) => {
                            const { video_name, frame_idx, answer } = frameData;
                            const frameName = `${video_name}_${frame_idx}`;
                            
                            return (
                                <div key={`frame_${index}`} className="qa-frame-row">
                                    <div className="qa-frame-name">
                                        <span className="frame-text">{frameName}</span>
                                    </div>
                                    <div className="qa-answer-display">
                                        <span className="answer-text">{answer || ''}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default QABoard
