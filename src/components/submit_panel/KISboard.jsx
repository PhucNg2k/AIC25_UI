import '../../styles/SubmitBoard.css'

function KISBoard({ submitType, submittedFrames, setSubmittedFrames }) {
    return (
        <div className="submit-board">
            {submittedFrames.length === 0 ? (
                <div className="empty-state">
                    <p>No frames submitted yet</p>
                    <p className="hint">Enter a query above and submit frames from any video to build your collection</p>
                </div>
            ) : (
                <table className="frames-table">
                    <thead>
                        <tr>
                            <th>Frame Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submittedFrames.map((frameData, index) => {
                            const { video_name, frame_idx } = frameData;
                            const frameName = `${video_name}_${frame_idx}`;
                            
                            return (
                                <tr key={`frame_${index}`} className="frame-row">
                                    <td className="frame-name">
                                        <span className="frame-text">{frameName}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default KISBoard