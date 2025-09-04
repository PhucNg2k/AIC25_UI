
// New multi-stage multi-modal search API (multipart/form-data)
// Sends 'stage_list' (JSON) and 'top_k'. Image files are attached as img_{stage}.
async function searchMultiModalAPI(searchData, maxResults=100) {
    if (!searchData) {
        alert("Form request must not be empty!");
        return;
    }

    const formData = new FormData();
    
    if (typeof maxResults !== 'undefined' && maxResults !== null) {
        formData.append('top_k', String(maxResults));
    }
    // Build stage_list JSON and attach per-stage image files
    const stageList = {};
    Object.entries(searchData || {}).forEach(([stageKey, modalities]) => {
        if (!modalities || typeof modalities !== 'object') return;
        const stageObj = {};
        // text-like modalities
        ['text', 'ocr', 'localized', 'asr'].forEach((mod) => {
            const entry = modalities[mod];
            if (entry && entry.value && String(entry.value).trim()) {
                stageObj[mod] = { value: String(entry.value).trim() };
                if (Object.prototype.hasOwnProperty.call(entry, 'obj_mask')) {
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
                const filename = file.name || 'image.jpg';
                formData.append(fieldName, file, filename);
                stageObj.img = { value: fieldName };
            } else if (img instanceof File || img instanceof Blob) {
                const filename = img.name || 'image.jpg';
                formData.append(fieldName, img, filename);
                stageObj.img = { value: fieldName };
            }
        }
        if (Object.keys(stageObj).length > 0) {
            stageList[stageKey] = stageObj;
        }
    });
    formData.append('stage_list', JSON.stringify(stageList));
    // Debug: log form-data contents (direct console.log on FormData appears empty)
    try {
        // eslint-disable-next-line no-console
        console.log("FORM DATA ENTRIES:");
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                // eslint-disable-next-line no-console
                console.log(`${key}: <File name=${value.name} size=${value.size}>`);
            } else {
                // eslint-disable-next-line no-console
                console.log(`${key}:`, value);
            }
        }
    } catch (_) {}

    const response = await fetch('http://localhost:8000/search-entry', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        let errorMessage = 'Multi-modal search request failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        } catch (_) {}
        throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.message || 'Multi-modal search failed');
    }
    return data.results;
}

function dataURLToBlob(dataUrl) {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) return new Blob();
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    const byteString = atob(parts[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: mime });
}

export { searchMultiModalAPI}