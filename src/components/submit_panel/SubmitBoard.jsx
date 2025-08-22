import '../../styles/SubmitBoard.css'

function SubmitBoard({ submittedFrames }) {
    // Generate frame name in format like L21_V001_33983
    const generateFrameName = (video_name, frame_idx) => {
        return `${video_name}_${frame_idx}`
    }

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
                            const frameName = generateFrameName(video_name, frame_idx);

                            return (
                                <tr key={`${frameName}_${index}`}>
                                    <td className="frame-name">{frameName}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default SubmitBoard
