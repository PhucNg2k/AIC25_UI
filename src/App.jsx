import { useState, useEffect } from 'react'
import './App.css'
import './styles.css'
import SearchPanel from './components/search/SearchPanel'
import ResultsPanel from './components/results/ResultsPanel'
import VideoPlayerPanel from './components/video_player/VideoPlayerPanel'
import FrameModal from './components/frame/FrameModal'
import FrameSliderModal from './components/frame/FrameSliderModal'

import { loadVideoMetadata } from './utils/metadata'
import { loadGroupedKeyframesMetadata, get_related_keyframe } from './utils/frame_submission'

import { searchImagesMock, searchImagesAPI, searchMultiModalAPI } from './utils/searching'
import SubmitPanel from "./components/submit_panel/SubmitPanel"


function App() {
  // State management
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentFramesList, setCurrentFramesList] = useState([])
  
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [showFrameModal, setShowFrameModal] = useState(false)
  const [showSliderModal, setShowSliderModal] = useState(false)
  
  const [selectedFrame, setSelectedFrame] = useState(null)
  
  const [sliderFrames, setSliderFrames] = useState([])
  const [sliderFrameIdx, setSliderFrameIdx] = useState(0)

  const [submitType, setSubmitType] = useState();
  
  // Query and task state
  const [query, setQuery] = useState('')
  const [queryId, setQueryId] = useState('')
  const [queryTask, setQueryTask] = useState('kis')

  // Per-task submissions
  const [submissions, setSubmissions] = useState({
    kis: [],                          // [{ video_name, frame_idx }]
    qa: [],                           // [{ video_name, frame_idx, answer }]
    trake: []                         // [{ video_name, frames: [idx1, idx2, ...] }]
  });

  // Derived current list + setter
  const currentList = submissions[queryTask];
  
  
  const setCurrentList = (updater) => {
    setSubmissions(prev => ({
      ...prev,
      [queryTask]: typeof updater === 'function' ? updater(prev[queryTask]) : updater,
    }));
  };

  // Handle submit type change - clear frames when switching modes
  const handleSubmitTypeChange = (newSubmitType) => {
    if (submitType !== newSubmitType) {
      setCurrentList([]);
      setSubmitType(newSubmitType);
    }
  };

  // Load video metadata on component mount
  useEffect(() => {
    loadVideoMetadata();
    loadGroupedKeyframesMetadata();

  }, [])


  

  // Search handler - called from SearchPanel
  const handleSearchResults = async (searchData, maxResults) => {
    console.log("SEARCH REQUEST\n", searchData);
    
    // Check if any search modality has data
    const hasSearchData = Object.values(searchData).some(modalData => 
      modalData && modalData.value && modalData.value.trim()
    );
    
    if (!hasSearchData) {
      alert('Please enter at least one search query');
      return;
    }

    setIsLoading(true)
    
    try {
      // Call the new multi-modal search API
      const results = await searchMultiModalAPI(searchData, maxResults);
      //const results = await searchImagesMock(query, maxResults);
      
      // Process and display results
      if (results && results.length > 0) {
        setSearchResults(results)
        
        // Group results by video and create video list for navigation
        
        
        // Spread all frames into one flat list
        //setCurrentFramesList(Object.values(groupedResults).flat())

        setCurrentFramesList(Object.values(results).flat())
      
      } else {
        setSearchResults([])
        setCurrentFramesList([])
      }
      
    } catch (error) {
      console.error('Search failed:', error)
      alert(error.message || 'Search request failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Clear handler
  const handleClear = () => {
    setSearchResults([])
    setCurrentFramesList([])
  }

  // Open video player
  const openVideoPlayer = (frameData) => {
    setSelectedFrame(frameData)
    setShowVideoPlayer(true)
  }

  // Open frame modal
  const openFrameModal = (frameData) => {
    setSelectedFrame(frameData)
    setShowFrameModal(true)
  }


  // Open slider modal
  const openSliderModal = (frames, currentImagePath) => {
    setSliderFrames(frames)
    setShowSliderModal(true);
    const BASE_DATA_PATH = "/REAL_DATA/keyframes_b1/keyframes"
    const frameIndex = frames.findIndex(f => `${BASE_DATA_PATH}/${f}` === currentImagePath);
    setSliderFrameIdx(frameIndex >= 0 ? frameIndex : 0);
  }

  // Submit frame handler - handles different task types
  const handleSubmitFrame = (frameData) => {
    const { video_name, frame_idx, image_path } = frameData;
    

    // Manual mode: behave as before, append single frame if not duplicate
    if (submitType === 'manual') {
      // Check if we've reached the 100 frame limit
      if (currentList.length >= 100) {
        alert('❌ Maximum limit reached!\n\nYou can only submit up to 100 frames. Please remove some frames before adding new ones.')
        return
      }
      if (queryTask === 'kis') {
        const isAlreadySubmitted = currentList.some(
          frame => frame.video_name === video_name && frame.frame_idx === frame_idx
        );
        if (!isAlreadySubmitted) {
          const newFrame = { video_name, frame_idx };
          setCurrentList(prev => [...prev, newFrame]);
        }
      } else if (queryTask === 'qa') {
        const isAlreadySubmitted = currentList.some(
          frame => frame.video_name === video_name && frame.frame_idx === frame_idx
        );
        if (!isAlreadySubmitted) {
          const newFrame = { video_name, frame_idx, answer: '' };
          setCurrentList(prev => [...prev, newFrame]);
        }
      } else if (queryTask === 'trake') {
        const existingVideoEntry = currentList.find(entry => entry.video_name === video_name);
        if (existingVideoEntry) {
          if (!existingVideoEntry.frames.includes(frame_idx)) {
            existingVideoEntry.frames.push(frame_idx);
            existingVideoEntry.frames.sort((a, b) => a - b);
            setCurrentList(prev => [...prev]);
          }
        } else {
          const newEntry = { video_name, frames: [frame_idx] };
          setCurrentList(prev => [...prev, newEntry]);
        }
      }
      return;
    }

    // Auto mode: replace current submissions with 100 related keyframes from the same video
    if (submitType === 'auto') {
      if (!image_path) {
        console.error('Auto submit requires image_path in frameData');
        return;
      }
      const related = get_related_keyframe(image_path);
      if (!related || related.length === 0) {
        console.error('No related keyframes found for image:', image_path);
        return;
      }

      const BASE_DATA_PATH = "/REAL_DATA/keyframes_b1/keyframes";
      // related entries look like: "Videos_L28_a/L28_V023/f007932.webp"
      // Extract video_name and frame_idx from each
      const newListKIS = related.map(rel => {
        const parts = rel.split('/');
        const videoName = parts[1];
        const frameFile = parts[2]; // f007932.webp
        const frameNumber = parseInt(frameFile.replace(/^f/, '').replace(/\.webp$/, ''), 10);
        return { video_name: videoName, frame_idx: frameNumber };
      });

      if (queryTask === 'kis') {
        setCurrentList(newListKIS);
      } else if (queryTask === 'qa') {
        const newListQA = newListKIS.map(({ video_name, frame_idx }) => ({ video_name, frame_idx, answer: '' }));
        setCurrentList(newListQA);
      } else if (queryTask === 'trake') { // need redesign logic
        // Group frames by video and store as { video_name, frames: [...] }
        const videoToFrames = {};
        newListKIS.forEach(({ video_name, frame_idx }) => {
          if (!videoToFrames[video_name]) videoToFrames[video_name] = [];
          videoToFrames[video_name].push(frame_idx);
        });
        const newTrakeList = Object.entries(videoToFrames).map(([video, frames]) => ({
          video_name: video,
          frames: frames.sort((a, b) => a - b)
        }));
        setCurrentList(newTrakeList);
      }
      return;
    }
  }

  // Clear submitted frames for current task
  const handleClearSubmissions = () => {
    setCurrentList([]);
  }


  return (
    <div className="main-container">
      <SearchPanel
        isLoading={isLoading}
        onSearch={handleSearchResults}
        onClear={handleClear}
        resultCount={searchResults.length}
      />
      
      <ResultsPanel
        searchResults={searchResults}
        onOpenVideoPlayer={openVideoPlayer}
        onOpenFrameModal={openFrameModal}
        currentFramesList={currentFramesList}
        onSubmitFrame={handleSubmitFrame}
        onOpenSliderModal={openSliderModal}
      />

      <SubmitPanel 
        query={query}
        setQuery={setQuery}
        queryId={queryId}
        setQueryId={setQueryId}
        queryTask={queryTask}
        setQueryTask={setQueryTask}
        submitType={submitType}
        setSubmitType={handleSubmitTypeChange}
        submittedFrames={currentList}
        setSubmittedFrames={setCurrentList}
        onClearSubmissions={handleClearSubmissions}
      />

      {showVideoPlayer && selectedFrame && (
        <VideoPlayerPanel
          initialFrame={selectedFrame}
          framesList={currentFramesList}
          onClose={() => setShowVideoPlayer(false)}
          onSubmitFrame={handleSubmitFrame}
        />
      )}
      
      {showFrameModal && selectedFrame && (
        <FrameModal
          frameData={selectedFrame}
          onClose={() => setShowFrameModal(false)}
        />
      )}

      {showSliderModal && (
        <FrameSliderModal
          isOpen={showSliderModal}
          onClose={() => setShowSliderModal(false)}
          relatedFrames={sliderFrames}
          currentIndex={sliderFrameIdx}
        />
      )}
    </div>
  )
}



// Group results by video name
function groupResultsByVideo(results) {
  const grouped = {}
  
  results.forEach(result => {
    if (!grouped[result.video_name]) {
      grouped[result.video_name] = []
    }
    grouped[result.video_name].push(result)
  })
  
  return grouped
}

export default App;