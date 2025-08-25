import { useState, useEffect } from 'react'
import './App.css'
import './styles.css'
import SearchPanel from './components/SearchPanel'
import ResultsPanel from './components/ResultsPanel'
import VideoPlayerPanel from './components/video_player/VideoPlayerPanel'
import FrameModal from './components/frame/FrameModal'
import { loadVideoMetadata } from './utils/metadata'
import { searchImagesMock, searchImagesAPI } from './utils/searching'
import SubmitPanel from "./components/submit_panel/SubmitPanel"


function App() {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [maxResults, setMaxResults] = useState(80)
  const [currentFramesList, setCurrentFramesList] = useState([])
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [showFrameModal, setShowFrameModal] = useState(false)
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [videoMetadata, setVideoMetadata] = useState({})
  const [submittedFrames, setSubmittedFrames] = useState([])

  // Load video metadata on component mount
  useEffect(() => {
    loadVideoMetadata().then(setVideoMetadata)
  }, [])

  // Search handler
  const handleSearch = async () => {
    const query = searchQuery.trim()
    
    if (!query) {
      alert('Please enter a search query')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Call the search API
      const results = await searchImagesAPI(query, maxResults);
      //const results = await searchImagesMock(query, maxResults);
      
      // Process and display results
      if (results && results.length > 0) {
        setSearchResults(results)
        
        // Group results by video and create video list for navigation
        const groupedResults = groupResultsByVideo(results)
        
        
        // Spread all frames into one flat list
        setCurrentFramesList(Object.values(groupedResults).flat())
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
    setSearchQuery('')
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

  // Submit frame handler
  const handleSubmitFrame = (frameData) => {
    // Check if frame is already submitted to avoid duplicates
    const isAlreadySubmitted = submittedFrames.some(
      frame => frame.video_name === frameData.video_name && frame.frame_idx === frameData.frame_idx
    )
    
    if (!isAlreadySubmitted) {
      // Check if we've reached the 100 frame limit
      if (submittedFrames.length >= 100) {
        alert('❌ Maximum limit reached!\n\nYou can only submit up to 100 frames. Please remove some frames before adding new ones.')
        return
      }
      
      // Only keep the essential data for export: video_name and frame_idx
      const essentialFrameData = {
        video_name: frameData.video_name,
        frame_idx: frameData.frame_idx
      }
      setSubmittedFrames(prev => [...prev, essentialFrameData])
    }
  }

  // Clear submitted frames
  const handleClearSubmissions = () => {
    setSubmittedFrames([])
  }

  return (
    <div className="main-container">
      <SearchPanel
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        maxResults={maxResults}
        setMaxResults={setMaxResults}
        isLoading={isLoading}
        onSearch={handleSearch}
        onClear={handleClear}
        resultCount={searchResults.length}
      />
      
      <ResultsPanel
        searchQuery={searchQuery}
        searchResults={searchResults}
        videoMetadata={videoMetadata}
        onOpenVideoPlayer={openVideoPlayer}
        onOpenFrameModal={openFrameModal}
        currentFramesList={currentFramesList}
      />

      <SubmitPanel 
        submittedFrames={submittedFrames}
        setSubmittedFrames={setSubmittedFrames}
        onClearSubmissions={handleClearSubmissions}
      />

      {showVideoPlayer && selectedFrame && (
        <VideoPlayerPanel
          initialFrame={selectedFrame}
          videoMetadata={videoMetadata}
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

export default App