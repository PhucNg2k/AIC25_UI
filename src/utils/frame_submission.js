

let grouped_keyframes_metadata = {}

// Load video metadata from JSON file
export async function loadGroupedKeyframesMetadata() {
    try {
        const response = await fetch("/Metadata/grouped_keyframes_metadata.json")
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        grouped_keyframes_metadata = data
        
        return grouped_keyframes_metadata
    } catch (error) {
        console.error("Failed to load  metadata:", error)
        // Fallback to empty object
        grouped_keyframes_metadata = {}
        return grouped_keyframes_metadata
    }
}

export function get_related_keyframe(image_path, n_before=19, n_after=80) { 
    // result in list of 100 keyframes path

    // image_path: /REAL_DATA/keyframes_b1/keyframes/Videos_L28_a/L28_V023/f007932.webp
    // extract to: key_name: Videos_L28_a, video_name: L28_V023, frame_id: f007932.webp
    const parts = image_path.split("/");

    // Ensure the path has enough segments
    if (parts.length < 3) {
        console.error("Invalid image path:", image_path);
        return null;
    }

    const frame_id = parts[parts.length - 1];           // f007932.webp
    const video_name = parts[parts.length - 2];         // L28_V023
    const key_name = parts[parts.length - 3];           // Videos_L28_a


    const framesList = grouped_keyframes_metadata[key_name][video_name];

    const currentIndex = framesList.findIndex( f => f === frame_id);

     if (currentIndex === -1) {
        console.error("Frame ID not found in metadata:", frame_id);
        return null;
    }

    // Calculate initial start and end indices
    let startIndex = Math.max(0, currentIndex - n_before);
    let endIndex = Math.min(framesList.length, currentIndex + n_after + 1);
    
    // Calculate how many frames we actually have
    const actualFrameCount = endIndex - startIndex;
    const targetFrameCount = n_before + n_after + 1; // Should be 100
    
    // If we don't have enough frames, adjust startIndex to get more frames from the beginning
    if (actualFrameCount < targetFrameCount) {
        const missingFrames = targetFrameCount - actualFrameCount;
        startIndex = Math.max(0, startIndex - missingFrames);
        
        // Recalculate endIndex to ensure we get exactly the target number of frames
        endIndex = Math.min(framesList.length, startIndex + targetFrameCount);
    }

    
    const result_frameList_fname = framesList.slice(startIndex, endIndex);

    const result_frameList = result_frameList_fname.map(f => `${key_name}/${video_name}/${f}`);

    return result_frameList;


}