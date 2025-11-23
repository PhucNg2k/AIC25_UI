// Usage:
//   node build-video-index.js /abs/path/to/folderA /abs/path/to/folderB --out src/data/video-index.json
//
// The script:
// - walks all *.json in the given folders
// - extracts `watch_url` (and `thumbnail_url` if present)
// - uses the file base name (e.g. L21_V001.json -> L21_V001) as the `video_name` key by default
//   If your JSON also contains a strong `title` or unique field for mapping, swap accordingly.

// batch1: /home/phucuy2025/Documents/AIC_2025/VBS_system/REAL_DATA/Data/media-info-aic25-b1/media-info
// batch2: /home/phucuy2025/Documents/AIC_2025/VBS_system/REAL_DATA/Data/media-info-aic25-b2/media-info

import fs from "node:fs";
import path from "node:path";

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.error("Failed to read JSON:", p, e.message);
    return null;
  }
}

function* walkJson(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      yield* walkJson(full);
    } else if (f.toLowerCase().endsWith(".json")) {
      yield full;
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const outFlag = args.indexOf("--out");
  if (outFlag === -1 || outFlag === args.length - 1) {
    console.error("Missing --out <outfile.json>");
    process.exit(1);
  }
  const outFile = args[outFlag + 1];
  const folders = args.filter((a, i) => i !== outFlag && i !== outFlag + 1);
  const index = {}; // {[video_name]: {watch_url, thumbnail_url}}

  for (const folder of folders) {
    for (const p of walkJson(folder)) {
      const base = path.basename(p, ".json"); // e.g L21_V001
      const j = readJsonSafe(p);
      if (!j) continue;

      // prefer explicit keys if present; other ffallback to file base name
      const video_name = j.video_name || base;
      const watch_url = j.watch_url || null;
      const thumbnail_url = j.thumbnail_url || null;
      const channel_url = j.channel_url || null;

      if (!watch_url) {
        // if JSON stores the url deeper (e.g., j.meta.watch_url)
        console.warn(`No watch_url in ${p}; skipping`);
        continue;
      }

      index[video_name] = { watch_url, thumbnail_url, channel_url };
    }
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(index, null, 2));
  console.log(`Wrote ${Object.keys(index).length} entries to ${outFile}`);
}

main();
