

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

export function get_related_keyframe(image_path, step, n_before=19, n_after=80) { 
    // result in list of 100 keyframes path

    // image_path: /REAL_DATA/keyframes_b1/keyframes/Videos_L28_a/L28_V023/f007932.webp
    // extract to: key_name: Videos_L28_a, video_name: L28_V023, frame_id: f007932.webp
    const parts = image_path.split("/");

    // Ensure the path has enough segments
    if (parts.length < 3) {
        console.error("Invalid image path:", image_path);
        return null;
    }

    let result_frameList_fname;

    const frame_id_str = parts[parts.length - 1];           // f007932.webp
    const video_name = parts[parts.length - 2];         // L28_V023
    const key_name = parts[parts.length - 3];           // Videos_L28_a

    
    if (step) {
            // Extract numeric frame ID
        result_frameList_fname = [];
        
        const match = frame_id_str.match(/f(\d+)\.webp/);
        if (!match) {
            console.error("Invalid frame ID format:", frame_id_str);
            return null;
        }

        const frame_id = parseInt(match[1], 10);
    
        // Generate frames before
        for (let i = n_before; i >= 1; i--) {
            const new_id = frame_id - i * step;
            if (new_id >= 0) {
                result_frameList_fname.push(`f${String(new_id).padStart(6, '0')}.webp`);
            }
        }

        // Include current frame
        result_frameList_fname.push(`f${String(frame_id).padStart(6, '0')}.webp`);

        // Generate frames after
        for (let i = 1; i <= n_after; i++) {
            const new_id = frame_id + i * step;
            result_frameList_fname.push(`f${String(new_id).padStart(6, '0')}.webp`);
        }

    } else {
        const framesList = grouped_keyframes_metadata[key_name][video_name];

        const currentIndex = framesList.findIndex( f => f === frame_id_str);

        if (currentIndex === -1) {
            console.error("Frame ID not found in metadata:", frame_id_str);
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

        result_frameList_fname = framesList.slice(startIndex, endIndex);
    }

    const result_frameList = result_frameList_fname.map(f => `${key_name}/${video_name}/${f}`);

    return result_frameList;


}