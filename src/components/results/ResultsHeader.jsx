import { fetchByVideoName } from "../../utils/searching";
import { useState, useEffect, useCallback } from "react";
import { apply_blacklist, apply_include } from "../../utils/blacklist_handler";
import "../../styles/ResultsHeader.css";

function ResultsHeader({
  searchResults,
  setSearchResults,
  displayMode,
  setDisplayMode,
  isFullscreen,
  onToggleFullscreen,
}) {
  const [videoName, setVideoName] = useState("");
  const [excludeInput, setExcludeInput] = useState("");
  const [excludeList, setExcludeList] = useState([]);
  const [includeInput, setIncludeInput] = useState("");
  const [includeList, setIncludeList] = useState([]);
  const [originalSearchResults, setOriginalSearchResults] = useState([]);
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);

  // Store original search results when they change (but not when filters are applied)
  useEffect(() => {
    if (!isFiltersApplied) {
      setOriginalSearchResults(searchResults);
    }
  }, [searchResults, isFiltersApplied]);

  const getSummaryText = () => {
    if (searchResults.length > 0) {
      return `Search results (${searchResults.length} frames found)`;
    }
    return "Enter a search query to see results";
  };

  const handleExcludeChange = (e) => {
    const inputValue = e.target.value;
    setExcludeInput(inputValue);

    // Convert input to list of strings, splitting by comma and trimming whitespace
    const excludeItems = inputValue
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter((item) => item.length > 0);

    setExcludeList(excludeItems);
  };

  const handleIncludeChange = (e) => {
    const inputValue = e.target.value;
    setIncludeInput(inputValue);

    // Convert input to list of strings, splitting by comma and trimming whitespace
    const includeItems = inputValue
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter((item) => item.length > 0);

    setIncludeList(includeItems);
  };

  const handleFetchByVideoName = async () => {
    if (!videoName.trim()) return;
    try {
      const results = await fetchByVideoName(videoName);
      if (results && results.length > 0) {
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Failed to fetch by video name:", error);
      alert(error.message || "Search request failed");
    }
    // setVideoName('');
  };

  const handleApplyFilters = () => {
    if (isFiltersApplied) {
      // Currently applied - restore original
      console.log("Restoring original search results");
      setSearchResults(originalSearchResults);
      setIsFiltersApplied(false);
    } else {
      let filteredResults = [...originalSearchResults];

      // Apply EXCLUDE filters first
      if (excludeList.length > 0) {
        for (let condition of excludeList) {
          filteredResults = apply_blacklist(condition, filteredResults);
        }
      }

      // Apply INCLUDE filters on the results after EXCLUDE
      if (includeList.length > 0) {
        let includedResults = [];
        for (let condition of includeList) {
          const conditionResults = apply_include(condition, filteredResults);
          includedResults = [...includedResults, ...conditionResults];
        }

        // Remove duplicates
        filteredResults = includedResults.filter(
          (result, index, self) =>
            index ===
            self.findIndex(
              (r) =>
                r.video_name === result.video_name &&
                r.frame_idx === result.frame_idx
            )
        );
      }

      console.log(
        `Filtered from ${originalSearchResults.length} to ${filteredResults.length} results`
      );
      setSearchResults(filteredResults);
      setIsFiltersApplied(true);
    }
  };

  return (
    <div className="results-header">
      <div className="results-header-top">
        <h2>Search Results</h2>

        <div className="video-search-controls">
          <div className="video-search-input-group">
            <label htmlFor="videoNameInput">Video name</label>
            <input
              id="videoNameInput"
              type="text"
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
              placeholder="Enter video name"
            />
            <button className="search-btn" onClick={handleFetchByVideoName}>
              Search
            </button>
          </div>

          <div className="video-exclude-input-group">
            <div className="exclude-input-row">
              <label htmlFor="excludeInput">EXCLUDE</label>
              <input
                id="excludeInput"
                type="text"
                value={excludeInput}
                onChange={handleExcludeChange}
                placeholder="K*, K12_V002, V2_V*"
              />
            </div>
            {excludeList.length > 0 && (
              <div className="exclude-preview">
                <small>Exclude filters: {excludeList.join(", ")}</small>
              </div>
            )}
          </div>

          <div className="video-include-input-group">
            <div className="include-input-row">
              <label htmlFor="includeInput">INCLUDE</label>
              <input
                id="includeInput"
                type="text"
                value={includeInput}
                onChange={handleIncludeChange}
                placeholder="L*, L20_V*, V2_V*"
              />
            </div>
            {includeList.length > 0 && (
              <div className="include-preview">
                <small>Include filters: {includeList.join(", ")}</small>
              </div>
            )}
          </div>

          <div className="apply-filters-section">
            <button
              className={`apply-btn ${
                isFiltersApplied ? "applied" : "not-applied"
              }`}
              onClick={handleApplyFilters}
            >
              {isFiltersApplied ? "RESTORE" : "APPLY"}
            </button>
          </div>
        </div>

        <div className="display-controls">
          <div className="display-mode-toggle">
            <button
              className={`mode-btn ${
                displayMode === "grouped" ? "active" : ""
              }`}
              onClick={() => setDisplayMode("grouped")}
              title="Group results by video"
            >
              📁 Grouped
            </button>
            <button
              className={`mode-btn ${
                displayMode === "ranking" ? "active" : ""
              }`}
              onClick={() => setDisplayMode("ranking")}
              title="Show results by ranking"
            >
              📊 Ranking
            </button>
          </div>

          <div>
            <button
              className="mode-btn"
              onClick={(e) => {
                e.stopPropagation(); // prevent bubbling
                onToggleFullscreen();
              }}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? "> Minimize" : "< Maximize"}
            </button>
          </div>
        </div>
      </div>

      <div className="results-summary">
        <span>{getSummaryText()}</span>
        {searchResults.length > 0 && (
          <span className="results-count">
            {searchResults.length} frame{searchResults.length !== 1 ? "s" : ""}{" "}
            found
          </span>
        )}
      </div>
    </div>
  );
}

export default ResultsHeader;
