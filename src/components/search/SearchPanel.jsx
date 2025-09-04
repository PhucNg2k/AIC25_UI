import SearchModal from "./SearchModal";
import ImageSearchModal from "./ImageSearchModal";
import SearchModalWrapper from "./SearchModalWrapper";
import SearchControls from "./SearchControls";
import "../../styles/SearchPanel.css";
import { useState, useCallback } from "react";

function SearchPanel({ isLoading, onSearch, onClear, resultCount }) {
  const [searchData, setSearchData] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);
  const [stages, setStages] = useState([1]);

  const updateInput = useCallback((stage_num, type, inputData) => {
    setSearchData((previousData) => {
      const draft = { ...previousData };
      const stageKey = String(stage_num || 1);
      const previousStageBucket = draft[stageKey] || {};
      const nextStageBucket = { ...previousStageBucket };

      const isImageModality = type === 'img';
      const hasValidImagePayload =
        inputData && (inputData.file || inputData.blob || inputData.dataUrl || inputData.url);
      const hasValidTextLikePayload =
        inputData && inputData.value && typeof inputData.value === 'string' && inputData.value.trim();

      if (inputData === null) {
        delete nextStageBucket[type];
      } else if (isImageModality) {
        if (hasValidImagePayload) {
          nextStageBucket[type] = inputData;
        } else {
          delete nextStageBucket[type];
        }
      } else {
        if (hasValidTextLikePayload) {
          const sanitized = {
            value: inputData.value,
          };
          if (inputData.obj_mask !== undefined) {
            sanitized.obj_mask = inputData.obj_mask;
          }
          nextStageBucket[type] = sanitized;
        } else {
          delete nextStageBucket[type];
        }
      }

      if (Object.keys(nextStageBucket).length > 0) {
        draft[stageKey] = nextStageBucket;
      } else {
        delete draft[stageKey];
      }

      return draft;
    });
  }, []);

  function handleClear() {
    setSearchData({});
    setResetTrigger((prev) => prev + 1);
    onClear();
  }

  const handleAddStage = () => {
    setStages((previousStages) => {
      const next = previousStages.length + 1;
      return [...previousStages, next];
    });
  };

  const handleRemoveStage = (stage_num) => {
    setStages((previousStages) => {
      const oldLen = previousStages.length;

      // Build remapped data from current snapshot
      const prevSnapshot = searchData || {};
      const nextData = {};

      // Copy all stages before the removed one
      for (let i = 1; i < stage_num; i++) {
        const key = String(i);
        if (prevSnapshot[key]) {
          nextData[key] = prevSnapshot[key];
        }
      }

      // Shift all stages after the removed one down by 1
      for (let i = stage_num + 1; i <= oldLen; i++) {
        const oldKey = String(i);
        const newKey = String(i - 1);
        if (prevSnapshot[oldKey]) {
          nextData[newKey] = prevSnapshot[oldKey];
        }
      }

      // Update state with the new mapping
      setSearchData(nextData);

      // Call updateInput for each moved/retained modality so downstream reacts
      Object.entries(nextData).forEach(([stageKey, modalities]) => {
        Object.entries(modalities).forEach(([type, payload]) => {
          updateInput(Number(stageKey), type, payload);
        });
      });

      // Rebuild the stage list with sequential numbers
      return Array.from({ length: oldLen - 1 }, (_, i) => i + 1);
    });
  };

  return (
    <div className="search-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <strong>Stages</strong>
        <button
          type="button"
          className="btn-primary"
          onClick={handleAddStage}
          style={{ padding: '6px 10px', fontSize: 12 }}
        >
          Add Stage
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {stages.map((stage_num, index) => (
          <SearchModalWrapper
            key={stage_num}
            stage_num={stage_num}
            updateInput={updateInput}
            resetTrigger={resetTrigger}
            onRemove={handleRemoveStage}
            disableRemove={stages.length === 1}
          />
        ))}
      </div>

      

      {/* Search Controls */}
      <SearchControls
        searchData={searchData}
        onSearch={onSearch}
        updateInput={updateInput}
        onClear={handleClear}
        isLoading={isLoading}
      />

      {/* Debug - Current Search Data */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          marginTop: "20px",
          fontSize: "12px",
          color: "#6c757d",
        }}
      >
        <strong>Current Search Data (stage_list):</strong>
        <pre>{JSON.stringify({ stage_list: searchData }, null, 2)}</pre>
      </div>
    </div>
  );
}

export default SearchPanel;
