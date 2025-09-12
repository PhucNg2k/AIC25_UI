// New multi-stage multi-modal search API (multipart/form-data)
// Sends 'stage_list' (JSON) and 'top_k'. Image files are attached as img_{stage}.
async function searchMultiModalAPI(searchData, maxResults = 100) {
  if (!searchData) {
    alert("Form request must not be empty!");
    return;
  }

  const formData = new FormData();

  if (typeof maxResults !== "undefined" && maxResults !== null) {
    formData.append("top_k", String(maxResults));
  }
  // Build stage_list JSON and attach per-stage image files
  const stageList = {};
  /**
   * Object.entries() converts the searchData object into an array of arrays,
   *  where each inner array contains a key-value pair from the object.
   * searchData = { key1: 'value1', key2: 'value2' },
   * Object.entries(searchData) returns [['key1', 'value1'], ['key2', 'value2']].
   */
  Object.entries(searchData || {}).forEach(([stageKey, modalities]) => {
    if (!modalities || typeof modalities !== "object") return;
    const stageObj = {};

    // Initialize weight_dict for this stage
    stageObj.weight_dict = {};

    // text-like modalities
    ["text", "ocr", "localized", "asr"].forEach((mod) => {
      const entry = modalities[mod]; // ModalityPayload
      if (entry && entry.value && String(entry.value).trim()) {
        stageObj[mod] = { value: String(entry.value).trim() }; // get text-query of this modal search
        if (Object.prototype.hasOwnProperty.call(entry, "obj_mask")) {
          stageObj[mod].obj_mask = entry.obj_mask;
        }
      }
    });

    // image modality
    const img = modalities.img;
    if (img) {
      const fieldName = `img_${stageKey}`;
      if (img.file) {
        const file = img.file;
        const filename = file.name || "image.jpg";
        formData.append(fieldName, file, filename);
        stageObj.img = { value: fieldName };
        // Add weight for image modality
      } else if (img instanceof File || img instanceof Blob) {
        const filename = img.name || "image.jpg";
        formData.append(fieldName, img, filename);
        stageObj.img = { value: fieldName };
      }
    }

    stageObj.weight_dict = modalities.weight_dict;

    if (Object.keys(stageObj).length > 0) {
      stageList[stageKey] = stageObj;
    }
  });
  formData.append("stage_list", JSON.stringify(stageList));

  // Debug: log form-data contents (direct console.log on FormData appears empty)
  /*
    try {
        // eslint-disable-next-line no-console
        console.log("FORM DATA ENTRIES:");
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: <File name=${value.name} size=${value.size}>`);
            } else {
                console.log(`${key}:`, value);
            }
        }
    } catch (_) {}
    */
  console.log("SEARCH-ENTRY");
  const response = await fetch("http://localhost:8000/search-entry", {
    method: "POST",
    body: formData,
  });
  console.log("AFTER SEARCH-ENTRY");
  if (!response.ok) {
    let errorMessage = "Multi-modal search request failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Multi-modal search failed");
  }
  return data.results;
}

function dataURLToBlob(dataUrl) {
  const parts = dataUrl.split(",");
  if (parts.length !== 2) return new Blob();
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([uint8Array], { type: mime });
}

// Validation function to check if search data is valid
function validateSearchData(searchData) {
  if (!searchData || Object.keys(searchData).length === 0) {
    return false;
  }

  const allStages = searchData || {};
  let ok = true;

  // Validate stage keys are contiguous 1..N
  const keys = Object.keys(allStages)
    .map((k) => Number(k))
    .filter((n) => Number.isInteger(n) && n > 0);
  if (keys.length > 0) {
    const sorted = [...keys].sort((a, b) => a - b); // ascending order
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i + 1) {
        ok = false;
        break;
      }
    }
  }

  return ok;
}

export { searchMultiModalAPI, validateSearchData };

// Fetch results by exact video name (server expects uppercase)
async function fetchByVideoName(videoName) {
  if (!videoName || !String(videoName).trim()) {
    throw new Error("Video name must not be empty");
  }

  const response = await fetch("http://localhost:8000/es-search/video_name", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      value: String(videoName).trim().toUpperCase(),
      top_k: -1,
    }),
  });

  if (!response.ok) {
    let errorMessage = "Video name search request failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Video name search failed");
  }

  return data.results || [];
}

export { fetchByVideoName };

// Translate a query file on the backend LLM service
async function fetchTranslate(fileName) {
  if (!fileName || !String(fileName).trim()) {
    throw new Error("File name must not be empty");
  }

  const response = await fetch("http://localhost:8000/llm/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_name: String(fileName).trim() }),
  });

  if (!response.ok) {
    let errorMessage = "Translation request failed";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  const data = await response.json();
  // If backend returns structured response
  if (data && Array.isArray(data.translated_text)) {
    return data.translated_text;
  }
  // Fallback: if backend directly returned the sentences array
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

export { fetchTranslate };
