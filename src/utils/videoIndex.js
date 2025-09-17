// (bundled approach): import JSON directly
// place the file at src/data/video-index.json

import index from "../data/video-index.json";
export function getWatchUrl(video_name) {
  return index[video_name]?.watch_url || null;
}
