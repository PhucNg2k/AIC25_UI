

function buildTrakeOffsets() {
  // Gradually expanding pattern for TRAKE with wider steps
  // Since we generate multiple combinations per offset (individual + combined moments),
  // we need wider increments to spread out faster
  // Maximum epsilon is ±30-35, avoid repeating the same offset
  
  const offsets = [];
  
  // Start with original frames (position 1)
  offsets.push(0);
  
  // Gradually expand with wider step increments, staying around ±30-35
  // Use steps: 0, ±1, ±3, ±5, ±8, ±12, ±17, ±23, ±28, ±32, ±35, ±37, ±38, ±39, ±40, ...
  let step = 1;
  let currentOffset = 1;
  
  while (offsets.length < 100) {
    // If we're approaching 30, use smaller steps
    if (currentOffset >= 25) {
      step = 1; // Use small steps when near the limit
    }
    
    offsets.push(currentOffset);
    offsets.push(-currentOffset);
    
    // Increase step size progressively
    currentOffset += step;
    step += 1;
  }
  
  return offsets.slice(0, 100);
}

export function interpolate_trake_frames(framesList, step = 5) {
    if (!framesList || framesList.length === 0) {
        return [];
    }

    const result = [];
    const offsets = buildTrakeOffsets();
    const numMoments = framesList.length;
    
    // FIRST: Create n+1 rows (1 original + n simultaneous combinations)
    // Row 1: Original
    result.push([...framesList]);
    
    // Rows 2 to n+1: Simultaneous combinations (only positive offsets to avoid duplicates)
    for (let i = 1; i <= numMoments; i++) {
        const offset = offsets[i] || 0;
        if (offset > 0) { // Only use positive offsets to avoid duplicates
            // Positive simultaneous
            const positiveJittered = framesList.map(frame => frame + offset);
            if (positiveJittered.every(frame => frame >= 0)) {
                result.push(positiveJittered);
            }
            
            // Negative simultaneous
            const negativeJittered = framesList.map(frame => frame - offset);
            if (negativeJittered.every(frame => frame >= 0)) {
                result.push(negativeJittered);
            }
        }
    }
    
    // SECOND: Create individual combinations starting from the last simultaneous
    const lastSimultaneousOffset = offsets[numMoments] || 0;
    const baseFrames = lastSimultaneousOffset !== 0 ? 
        framesList.map(frame => frame + lastSimultaneousOffset) : 
        [...framesList];
    
    // Apply individual offsets to each moment
    for (let momentIndex = 0; momentIndex < numMoments; momentIndex++) {
        for (let offsetIndex = numMoments + 1; offsetIndex < offsets.length; offsetIndex++) {
            const offset = offsets[offsetIndex];
            if (offset !== 0) {
                const newFramesList = [...baseFrames];
                newFramesList[momentIndex] += offset;
                
                // Check if the jittered frame is non-negative
                if (newFramesList[momentIndex] >= 0) {
                    result.push(newFramesList);
                }
            }
        }
    }
    
    console.log(result.slice(0,100));
    // Ensure we return exactly 100 rows
    return result.slice(0, 100);
}