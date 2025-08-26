// Mock API function - replace with your actual backend call
async function searchImagesMock(query, maxResults) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data structure matching your Python retrieve.py output
    const mockResults = [
    {
      "video_name": "L21_V001",
      "frame_idx": 273,
      "image_path": "/REAL_DATA/Data/keyframes/L21_V001/273.jpg",
      "score": 64.25734907388687
    },
    {
      "video_name": "L22_V025",
      "frame_idx": 200,
      "image_path": "/REAL_DATA/Data/keyframes/L22_V025/200.jpg",
      "score": 64.25401568412781
    },
    {
      "video_name": "L21_V008",
      "frame_idx": 303,
      "image_path": "/REAL_DATA/Data/keyframes/L21_V008/303.jpg",
      "score": 64.25155848264694
    },
    {
      "video_name": "L21_V010",
      "frame_idx": 258,
      "image_path": "/REAL_DATA/Data/keyframes/L21_V010/258.jpg",
      "score": 64.22499567270279
    },
    {
      "video_name": "L21_V008",
      "frame_idx": 287,
      "image_path": "/REAL_DATA/Data/keyframes/L21_V008/287.jpg",
      "score": 64.18094784021378
    },
    {
      "video_name": "L21_V006",
      "frame_idx": 225,
      "image_path": "/REAL_DATA/Data/keyframes/L21_V006/225.jpg",
      "score": 64.1387090086937
    },
    {
      "video_name": "L22_V006",
      "frame_idx": 189,
      "image_path": "/REAL_DATA/Data/keyframes/L22_V006/189.jpg",
      "score": 64.12862837314606
    },
    {
      "video_name": "L21_V001",
      "frame_idx": 185,
      "image_path": "/REAL_DATA/Data/keyframes/L21_V001/185.jpg",
      "score": 64.12700116634369
    },
    {
      "video_name": "L21_V006",
      "frame_idx": 242,
      "image_path": "/REAL_DATA/Data/keyframes/L21_V006/242.jpg",
      "score": 64.08957242965698
    },
    {
      "video_name": "L26_V239",
      "frame_idx": 118,
      "image_path": "/REAL_DATA/Data/keyframes/L26_V239/118.jpg",
      "score": 64.02166187763214
    }
  ]
    
    return mockResults.slice(0, maxResults)
}


async function searchImagesAPI(query, maxResults) {
    const response = await fetch('http://localhost:8000/textSearch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            top_k: maxResults
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Search request failed');
    }
    
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.message || 'Search failed');
    }
    
    // Return the results in the expected format
    return data.results;
}





// New multi-modal search API function
async function searchMultiModalAPI(searchData, maxResults) {
    // Extract search modalities from the searchData object
    const requestBody = {
        top_k: maxResults
    };
    
    // Add text search if available
    if (searchData.text && searchData.text.value) {
        requestBody.text = searchData.text.value.trim();
    }
    
    // Add OCR search if available
    if (searchData.ocr && searchData.ocr.value) {
        requestBody.ocr = searchData.ocr.value.trim();
    }
    
    // Add localized/location search if available
    if (searchData.localized && searchData.localized.value) {
        requestBody.localized = searchData.localized.value.trim();
    }
    
    console.log('Multi-modal search request:', requestBody);
    
    const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Multi-modal search request failed');
    }
    
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.message || 'Multi-modal search failed');
    }
    
    // Return the results in the expected format
    return data.results;
}

export {searchImagesMock, searchImagesAPI, searchMultiModalAPI}