// Metadata utilities converted from utils.js
function normalizePath(relativePath) {
    // Remove leading "../" and ensure it starts with "/"
    const stripped = relativePath.replace(/^(\.\.\/)+/, '')
    return '/' + stripped
}

let videoMetadata = {}

// Load video metadata from JSON file
export async function loadVideoMetadata() {
    try {
        const response = await fetch("/Metadata/video_metadata_new.json")
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        videoMetadata = data
        console.log("Video metadata loaded:", Object.keys(videoMetadata).length, "videos")


        return 
    } catch (error) {
        console.error("Failed to load video metadata:", error)
        // Fallback to empty object
        videoMetadata = {}
        return videoMetadata
    }
}

export function getMetadataKey(videoName, frameIdx) {
    const safeIdx = Number.isFinite(frameIdx) ? frameIdx : 0
    const frameFormatted = String(safeIdx).padStart(6, '0')
    return `${videoName}_${frameFormatted}`
}

// Helper functions to access video metadata
export function getVideoFPS(metaKey) {
    return videoMetadata[metaKey]?.fps || 30 // Default to 30 FPS
}

export function getFrameIdx(metaKey) {
    return videoMetadata[metaKey]?.frame_idx || null;
}

export function getPTStime(metaKey) {
    return videoMetadata[metaKey]?.pts_time || 0.0;
}

export function getVideoDuration(metaKey) {
    return videoMetadata[metaKey]?.video_duration || null;
}

export function getFramePath(metaKey) {
    return videoMetadata[metaKey]?.frame_path || "";
}

export { normalizePath }
