import '../../styles/SubmitBoard.css'

function QABoard({ submitType, submittedFrames, setSubmittedFrames }) {
    const handleAnswerChange = (frameIndex, answer) => {
        setSubmittedFrames(prev => {
            const newFrames = [...prev];
            
            newFrames[frameIndex] = {
                ...newFrames[frameIndex],
                answer: answer
            };
            return newFrames;
        });
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
                                    <div className="qa-answer-input">
                                        <input
                                            type="text"
                                            value={answer || ''}
                                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                                            placeholder="Enter your answer..."
                                            className="answer-field"
                                        />
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
