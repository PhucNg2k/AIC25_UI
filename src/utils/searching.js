
// New multi-modal search API function (multipart/form-data)
async function searchMultiModalAPI(searchData, maxResults=100) {
    if (!searchData) {
        return;
    }

    const formData = new FormData();
    
    if (typeof maxResults !== 'undefined' && maxResults !== null) {
        formData.append('top_k', String(maxResults));
    }
    
    if (searchData && searchData.text && searchData.text.value) {
        formData.append('text', searchData.text.value.trim());
    }
    
    if (searchData && searchData.ocr && searchData.ocr.value) {
        formData.append('ocr', searchData.ocr.value.trim());
    }
    
    if (searchData && searchData.localized && searchData.localized.value) {
        formData.append('localized', searchData.localized.value.trim());
    }
    
    // Handle image input flexibly
    if (searchData && searchData.img) {
        const img = searchData.img;
        if (img instanceof File || img instanceof Blob) {
            const filename = img.name || 'image.jpg';
            formData.append('img', img, filename);
        } else if (img && img.file) {
            const file = img.file;
            const filename = file.name || 'image.jpg';
            formData.append('img', file, filename);
        } else if (img && img.blob) {
            const blob = img.blob;
            const filename = (img.filename || 'image.jpg');
            formData.append('img', blob, filename);
        } else if (img && img.dataUrl) {
            const blob = dataURLToBlob(img.dataUrl);
            formData.append('img', blob, 'image.jpg');
        } else if (img && img.url) {
            formData.append('img_url', img.url);
        }
    }
    
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