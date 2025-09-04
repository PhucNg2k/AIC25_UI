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
      const providedWeight = inputData && typeof inputData.weight !== 'undefined' ? Number(inputData.weight) : undefined;

      if (inputData === null) {
        delete nextStageBucket[type];
      } else if (isImageModality) {
        if (hasValidImagePayload) {
          // Do not persist weight on modality payload
          const { weight, ...rest } = inputData || {};
          nextStageBucket[type] = rest;
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
          // Do not persist weight on modality payload
          nextStageBucket[type] = sanitized;
        } else {
          delete nextStageBucket[type];
        }
      }

      // Build/refresh weight_dict without storing weights in modalities
      const presentModalities = Object.keys(nextStageBucket).filter((k) => k !== 'weight_dict');
      if (presentModalities.length > 0) {
        const prevWeightDict = (previousStageBucket && previousStageBucket.weight_dict) || {};
        const weight_dict = { ...prevWeightDict };

        // If clearing a modality, ensure its weight is removed
        Object.keys(prevWeightDict).forEach((mod) => {
          if (!presentModalities.includes(mod)) {
            delete weight_dict[mod];
          }
        });

        // If current call provided a weight, update it for this modality
        if (typeof providedWeight !== 'undefined' && Number.isFinite(providedWeight)) {
          weight_dict[type] = Number(providedWeight);
        }

        // Ensure all present modalities have a weight (default 1)
        for (const mod of presentModalities) {
          if (typeof weight_dict[mod] === 'undefined') {
            weight_dict[mod] = 1;
          }
        }

        nextStageBucket.weight_dict = weight_dict;
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
    setStages([1]);
    onClear();
  }

  const handleAddStage = () => {
    setStages((previousStages) => {
      const next = previousStages.length + 1;
      return [...previousStages, next];
    });
  };

  const handleRemoveStage = (stage_num) => {
    const prevSnapshot = searchData || {};
    const numericKeys = Object.keys(prevSnapshot)
      .map((k) => Number(k))
      .filter((n) => Number.isInteger(n) && n > 0);
    const maxKey = numericKeys.length > 0 ? Math.max(...numericKeys) : (stages.length || 0);

    // 1) Clear all modalities of the removed stage via updateInput(null)
    const removedKey = String(stage_num);
    const removedStage = prevSnapshot[removedKey] || {};
    if (removedStage && Object.keys(removedStage).length > 0) {
      Object.entries(removedStage).forEach(([type, payload]) => {
        if (type === 'weight_dict') return;
        updateInput(stage_num, type, null);
      });
    }

    // 2) Shift later stages down by 1 by re-emitting their payloads
    for (let i = stage_num + 1; i <= maxKey; i++) {
      const oldKey = String(i);
      const newIndex = i - 1;
      const stageBucket = prevSnapshot[oldKey];
      if (!stageBucket) continue;
      const oldWeights = (stageBucket && stageBucket.weight_dict) || {};
      Object.entries(stageBucket).forEach(([type, payload]) => {
        if (type === 'weight_dict') return;
        const weightForType = typeof oldWeights[type] !== 'undefined' ? Number(oldWeights[type]) : undefined;
        if (payload && typeof payload === 'object') {
          const payloadWithWeight = { ...payload };
          if (typeof weightForType !== 'undefined' && Number.isFinite(weightForType)) {
            payloadWithWeight.weight = weightForType;
          }
          updateInput(newIndex, type, payloadWithWeight);
        } else {
          updateInput(newIndex, type, payload);
        }
        // clear the old location
        updateInput(i, type, null);
      });
    }

    // 3) Update stages list
    setStages((previousStages) => Array.from({ length: Math.max(0, previousStages.length - 1) }, (_, i) => i + 1));
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
            stageData={searchData[String(stage_num)] || {}}
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
      {(() => {
        // validate each stage weight sum === 1 and stage keys contiguous 1..N
        const allStages = searchData || {};
        let ok = true;
        Object.values(allStages).forEach((stage) => {
          if (stage && stage.weight_dict) {
            const sum = Object.values(stage.weight_dict).reduce((a, b) => a + Number(b || 0), 0);
            if (Math.abs(sum - 1) > 1e-6) ok = false;
          }
        });
        const keys = Object.keys(allStages).map((k) => Number(k)).filter((n) => Number.isInteger(n) && n > 0);
        if (keys.length > 0) {
          const sorted = [...keys].sort((a, b) => a - b);
          for (let i = 0; i < sorted.length; i++) {
            if (sorted[i] !== i + 1) {
              ok = false;
              break;
            }
          }
        }
        const replacer = (key, value) => {
          // Pretty-print File/Blob objects to show name/size/type
          if (typeof File !== 'undefined' && value instanceof File) {
            return { name: value.name};
          }
          if (typeof Blob !== 'undefined' && value instanceof Blob) {
            return { name: '(blob)' };
          }
          return value;
        };
        return (
          <div
            style={{
              background: ok ? "#e9f7ef" : "#fbeaea",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "20px",
              fontSize: "12px",
              color: ok ? "#1e7e34" : "#a71d2a",
              border: `1px solid ${ok ? '#c3e6cb' : '#f5c6cb'}`,
            }}
          >
            <strong>Current Search Data (stage_list):</strong>
            <pre>{JSON.stringify({ stage_list: searchData }, replacer, 2)}</pre>
          </div>
        );
      })()}
    </div>
  );
}

export default SearchPanel;
