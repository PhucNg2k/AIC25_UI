import '../../styles/SubmitPreview.css'

function SubmitPreview({ submittedFrames }) {
    const generateFrameNames = () => {
        return submittedFrames.map(frame => `${frame.video_name}_${frame.frame_idx}`)
    }

    const getPreviewData = () => {
        if (!submittedFrames || submittedFrames.length === 0) return null
        
        const frameNames = generateFrameNames()
        return {
            frameCount: submittedFrames.length,
            firstFewFrames: frameNames.slice(0, 3),
            hasMore: frameNames.length > 3
        }
    }

    const preview = getPreviewData()

    if (!preview) return null

    return (
        <div className="submit-preview">
            <p className="preview-count">{preview.frameCount} frame{preview.frameCount !== 1 ? 's' : ''} selected</p>
            {preview.firstFewFrames.length > 0 && (
                <div className="preview-frames">
                    {preview.firstFewFrames.map((frameName, index) => (
                        <span key={index} className="preview-frame">{frameName}</span>
                    ))}
                    {preview.hasMore && <span className="preview-more">...</span>}
                </div>
            )}
        </div>
    )
}

export default SubmitPreview
