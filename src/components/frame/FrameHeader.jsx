export default function FrameHeader({ video_name, target_frame, timestamp }) {
    return (
        <div className="frame-header">
            <span className="header-item" title={video_name}>{video_name}</span>
            <span className="header-item">{timestamp}</span>
            <span className="header-item">#{target_frame}</span>
        </div>
    )
}