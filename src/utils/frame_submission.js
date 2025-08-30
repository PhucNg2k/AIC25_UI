let grouped_keyframes_metadata = {};

// Load video metadata from JSON file
export async function loadGroupedKeyframesMetadata() {
  try {
    const response = await fetch("/Metadata/grouped_keyframes_metadata.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    grouped_keyframes_metadata = data;
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

export function get_related_keyframe(
  image_path,
  step,
  n_before = 19,
  n_after = 80
) {
  // image_path: /REAL_DATA/keyframes_b1/keyframes/Videos_L28_a/L28_V023/f007932.webp
  // extract to: key_name: Videos_L28_a, video_name: L28_V023, frame_id: f007932.webp
  const parts = image_path.split("/");

  if (parts.length < 3) {
    console.error("Invalid image path:", image_path);
    return null;
  }

  let result_frameList_fname;
  const frame_id_str = parts[parts.length - 1]; // f007932.webp
  const video_name = parts[parts.length - 2]; // L28_V023
  const key_name = parts[parts.length - 3]; // Videos_L28_a

  // Build the alternating proximity order once
  const offsets = buildInterleavedOffsets(n_before, n_after);

  if (step) {
    // -------- Exact numeric frames with stride = step --------
    const match = frame_id_str.match(/f(\d+)\.webp/);
    if (!match) {
      console.error("Invalid frame ID format:", frame_id_str);
      return null;
    }

    const frame_id = parseInt(match[1], 10);
    result_frameList_fname = [];

    for (const off of offsets) {
      const new_id = frame_id + off * step;
      if (new_id < 0) continue; // skip negatives
      result_frameList_fname.push(`f${String(new_id).padStart(6, "0")}.webp`);
    }
  } else {
    // -------- Use precomputed keyframe list from metadata --------
    const framesList =
      grouped_keyframes_metadata?.[key_name]?.[video_name] || null;

    if (!Array.isArray(framesList)) {
      console.error(
        "Missing frames list in metadata for:",
        key_name,
        video_name
      );
      return null;
    }

    const currentIndex = framesList.findIndex((f) => f === frame_id_str);
    if (currentIndex === -1) {
      console.error("Frame ID not found in metadata:", frame_id_str);
      return null;
    }

    // Filter offsets to those that land inside the list
    const inBounds = offsets
      .map((off) => currentIndex + off)
      .filter((idx) => idx >= 0 && idx < framesList.length);

    // If you want to cap to exactly (n_before + n_after + 1), slice here:
    const targetCount = n_before + n_after + 1;
    const chosen = inBounds.slice(0, targetCount);

    result_frameList_fname = chosen.map((idx) => framesList[idx]);
  }

  // Stitch back to "key_name/video_name/filename"
  const result_frameList = result_frameList_fname.map(
    (f) => `${key_name}/${video_name}/${f}`
  );

  return result_frameList;
}
