let grouped_keyframes_metadata = {};

// Load video metadata from JSON file
export async function loadGroupedKeyframesMetadata() {
  try {
    const response = await fetch("/Metadata/grouped_keyframes_metadata.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    grouped_keyframes_metadata = data;
    console.log("Fetched: ", grouped_keyframes_metadata);
    return grouped_keyframes_metadata;
  } catch (error) {
    console.error("Failed to load metadata:", error);
    grouped_keyframes_metadata = {};
    return grouped_keyframes_metadata;
  }
}

/**
 * Build an offsets array centered at 0, alternating -k and +k:
 *   [0, -1, +1, -2, +2, ...]
 * Bounded by n_before / n_after.
 */

function buildInterleavedOffsets(n_before, n_after) {
  const offsets = [0];
  const maxK = Math.max(n_before, n_after);
  for (let k = 1; k <= maxK; k++) {
    if (k <= n_before) offsets.push(-k);
    if (k <= n_after) offsets.push(+k);
  }
  return offsets;
}

const TOP_AT_R = [1, 5, 20, 100];

function buildSubmissionPattern(step) {
  // Gradually expanding pattern: 0 -> ±1 -> ±2 -> ±3 -> ... until 100 frames
  // This creates a natural progression from narrow to wide temporal coverage

  const offsets = [];

  for (let idx = 0; idx <= 50; idx++) {
    if (idx === 0) {
      offsets.push(idx);
      continue;
    }
    offsets.push(idx);
    offsets.push(-idx);
  }

  return offsets.slice(0, 100);
}

export function get_related_keyframe(
  image_path,
  step = 0,
  sorted = false,
  n_before = 19,
  n_after = 80
) {
  // image_path: /REAL_DATA/keyframes_b1/keyframes/Videos_L28_a/L28_V023/f007932.webp
  // extract to: key_name: Videos_L28_a, video_name: L28_V023, frame_id: f007932.webp
  const parts = image_path.split("/");

  if (parts.length < 3) {
    console.log("error: ", image_path);
    console.error("Invalid image path:", image_path);
    return null;
  }

  let result_frameList_fname;
  const frame_id_str = parts[parts.length - 1]; // f007932.webp
  const video_name = parts[parts.length - 2]; // L28_V023
  const key_name = parts[parts.length - 3]; // Videos_L28_a

  if (step >= 1) {
    // SUBMISSION - interpolate other frames id
    // -------- Exact numeric frames with stride = step --------
    const match = frame_id_str.match(/f(\d+)\.webp/);
    if (!match) {
      console.error("Invalid frame ID format:", frame_id_str);
      return null;
    }

    const frame_id = parseInt(match[1], 10); // base 10 (radix)
    result_frameList_fname = [];

    if (sorted) {
      // Submission pattern for video retrieval optimization
      const offsets = buildSubmissionPattern(step);
      for (const off of offsets) {
        const new_id = frame_id + off * step;
        if (new_id < 0) continue; // skip negatives
        result_frameList_fname.push(`f${String(new_id).padStart(6, "0")}.webp`);
      }
    } else {
      // no sort, just get n_before, self, n_after
      // gen frames before
      for (let i = n_before; i >= 1; i--) {
        const new_id = frame_id - i * step;
        if (new_id >= 0) {
          result_frameList_fname.push(
            `f${String(new_id).padStart(6, "0")}.webp`
          );
        }
      }

      // Include current frame
      result_frameList_fname.push(`f${String(frame_id).padStart(6, "0")}.webp`);

      // Gen frames after
      for (let i = 1; i <= n_after; i++) {
        const new_id = frame_id + i * step;
        result_frameList_fname.push(`f${String(new_id).padStart(6, "0")}.webp`);
      }
    }
  } else {
    // -------- Use precomputed keyframe list --------
    // console.log("key_name = ", key_name);
    // console.log("video_name = ", video_name);

    const framesList =
      grouped_keyframes_metadata?.[key_name]?.[video_name] || null;
    // console.log("framesList = ", framesList);
    const currentIndex = framesList.findIndex((f) => f === frame_id_str);
    if (currentIndex === -1) {
      console.error("Frame ID not found in metadata:", frame_id_str);
      return null;
    }

    if (sorted) {
      // push chosen frame to top
      // Build the alternating proximity order for keyframe metadata
      const offsets = buildInterleavedOffsets(n_before, n_after);
      // Filter offsets to those that land inside the list
      const inBounds = offsets
        .map((off) => currentIndex + off)
        .filter((idx) => idx >= 0 && idx < framesList.length);

      // If you want to cap to exactly (n_before + n_after + 1), slice here:
      const targetCount = n_before + n_after + 1;
      const chosen = inBounds.slice(0, targetCount); // include 0, exclude the target count

      result_frameList_fname = chosen.map((idx) => framesList[idx]);

      // --- ✅ Padding if fewer than targetCount ---
      if (result_frameList_fname.length < targetCount) {
        const padCount = targetCount - result_frameList_fname.length;
        const padFrame = framesList[currentIndex]; // chosen frame
        result_frameList_fname = [
          ...result_frameList_fname,
          ...Array(padCount).fill(padFrame),
        ];
      }
    } else {
      // KEYFRAMES SLIDER

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
  }

  // Stitch back to "key_name/video_name/filename"
  const result_frameList = result_frameList_fname.map(
    (f) => `${key_name}/${video_name}/${f}`
  );

  return result_frameList;
}
