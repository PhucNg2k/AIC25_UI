export default function FrameHeader({ video_name, target_frame, timestamp }) {
    // Convert seconds to minute:second format
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    

    return (
        <div className="frame-header">
            <span className="header-item" title={video_name}>{video_name}</span>
            <span className="header-item">{formatTime(timestamp)}</span>
            <span className="header-item">#{target_frame}</span>
        </div>
    )
}