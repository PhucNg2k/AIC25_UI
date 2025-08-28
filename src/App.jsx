import { useState, useEffect } from 'react'
import './App.css'
import './styles.css'
import SearchPanel from './components/search/SearchPanel'
import ResultsPanel from './components/results/ResultsPanel'
import VideoPlayerPanel from './components/video_player/VideoPlayerPanel'
import FrameModal from './components/frame/FrameModal'
import { loadVideoMetadata } from './utils/metadata'
import { searchImagesMock, searchImagesAPI, searchMultiModalAPI } from './utils/searching'
import SubmitPanel from "./components/submit_panel/SubmitPanel"


function App() {
  // State management
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentFramesList, setCurrentFramesList] = useState([])
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [showFrameModal, setShowFrameModal] = useState(false)
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [videoMetadata, setVideoMetadata] = useState({})
  
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

  // Load video metadata on component mount
  useEffect(() => {
    loadVideoMetadata().then(setVideoMetadata)
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

  // Submit frame handler - handles different task types
  const handleSubmitFrame = (frameData) => {
    const { video_name, frame_idx } = frameData;
    
    // Check if we've reached the 100 frame limit
    if (currentList.length >= 100) {
      alert('❌ Maximum limit reached!\n\nYou can only submit up to 100 frames. Please remove some frames before adding new ones.')
      return
    }

    if (queryTask === 'kis') {
      // KIS: simple video_name + frame_idx
      const isAlreadySubmitted = currentList.some(
        frame => frame.video_name === video_name && frame.frame_idx === frame_idx
      );
      
      if (!isAlreadySubmitted) {
        const frameData = { video_name, frame_idx };
        setCurrentList(prev => [...prev, frameData]);
      }
    } else if (queryTask === 'qa') {
      // QA: video_name + frame_idx + answer (initially empty)
      const isAlreadySubmitted = currentList.some(
        frame => frame.video_name === video_name && frame.frame_idx === frame_idx
      );
      
      if (!isAlreadySubmitted) {
        const frameData = { video_name, frame_idx, answer: '' };
        setCurrentList(prev => [...prev, frameData]);
      }
    } else if (queryTask === 'trake') {
      // TRAKE: group consecutive frames by video
      const existingVideoEntry = currentList.find(entry => entry.video_name === video_name);
      
      if (existingVideoEntry) {
        // Add frame to existing video entry if not already there
        if (!existingVideoEntry.frames.includes(frame_idx)) {
          existingVideoEntry.frames.push(frame_idx);
          existingVideoEntry.frames.sort((a, b) => a - b); // Keep frames sorted
          setCurrentList(prev => [...prev]); // Trigger re-render
        }
      } else {
        // Create new video entry
        const frameData = { video_name, frames: [frame_idx] };
        setCurrentList(prev => [...prev, frameData]);
      }
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
        videoMetadata={videoMetadata}
        onOpenVideoPlayer={openVideoPlayer}
        onOpenFrameModal={openFrameModal}
        currentFramesList={currentFramesList}
        onSubmitFrame={handleSubmitFrame}
      />

      <SubmitPanel 
        query={query}
        setQuery={setQuery}
        queryId={queryId}
        setQueryId={setQueryId}
        queryTask={queryTask}
        setQueryTask={setQueryTask}
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