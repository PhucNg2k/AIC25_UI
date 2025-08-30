

export function interpolate_trake_frames(framesList, step = 5, epsilon = 50) {
    if (!framesList || framesList.length === 0) {
        return [];
    }

    const result = [];
    
    // Add the original anchor frames as the first row (most likely to be correct)
    result.push([...framesList]);
    
    // Generate variations by updating all frames simultaneously
    for (let offset = -epsilon; offset <= epsilon; offset += step) {
        if (offset === 0) continue; // Skip the original anchor frames (already added)
        
        const newFramesList = framesList.map(frame => frame + offset);
        
        // Check if all frames are non-negative
        if (newFramesList.every(frame => frame >= 0)) {
            result.push(newFramesList);
        }
    }
    
    // If we don't have 100 rows yet, add more variations with random directions
    let additionalOffset = step;
    while (result.length < 100) {
        // Generate random directions for each frame
        const randomDirections = framesList.map(() => Math.random() < 0.5 ? 1 : -1);
        const newFramesList = framesList.map((frame, index) => 
            frame + (additionalOffset * randomDirections[index])
        );
        
        if (newFramesList.every(frame => frame >= 0)) {
            result.push(newFramesList);
        }
        
        additionalOffset += step;
    }
    
    // Ensure we return exactly 100 rows
    return result.slice(0, 100);
}