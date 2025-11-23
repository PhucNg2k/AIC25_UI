import SearchModal from "./SearchModal";
import ImageSearchModal from "./ImageSearchModal";
import SearchModalWrapper from "./SearchModalWrapper";
import SearchControls from "./SearchControls";
import "../../styles/SearchPanel.css";
import { useState, useCallback } from "react";

function SearchPanel({ isLoading, onSearch, onClear, resultCount }) {
  const [searchData, setSearchData] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);
  const [events, setEvents] = useState([1]);

  const updateInput = useCallback((event_num, type, inputData) => {
    setSearchData((previousData) => {
      const draft = { ...previousData };
      const n = Number(event_num);
      const eventKey = Number.isInteger(n) && n > 0 ? String(n) : "1";
      // This gets the current modalities and weights for the stage, as stored in the previous state.
      // if you're updating a new stage, you start with an empty obj
      // if youre updating an existing stage, you retrieve its current data
      const previousEventBucket = draft[eventKey] || {};
      // shallow copy that can be modify without mutatiing the previous state directly
      const nextEventBucket = { ...previousEventBucket };

      const isImageModality = type === "img";
      const hasValidImagePayload =
        inputData &&
        (inputData.file ||
          inputData.blob ||
          inputData.dataUrl ||
          inputData.url);
      const hasValidTextLikePayload =
        inputData &&
        inputData.value &&
        typeof inputData.value === "string" &&
        inputData.value.trim();
      const providedWeight =
        inputData && typeof inputData.weight !== "undefined"
          ? Number(inputData.weight)
          : undefined;

      if (inputData === null) {
        delete nextEventBucket[type];
      } else if (isImageModality) {
        if (hasValidImagePayload) {
          // Do not persist weight on modality payload
          const { weight, ...rest } = inputData || {};
          nextEventBucket[type] = rest;
        } else {
          delete nextEventBucket[type];
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
          nextEventBucket[type] = sanitized;
        } else {
          delete nextEventBucket[type];
        }
      }

      // Build/refresh weight_dict without storing weights in modalities
      const presentModalities = Object.keys(nextEventBucket).filter(
        (k) => k !== "weight_dict"
      );
      if (presentModalities.length > 0) {
        const prevWeightDict =
          (previousEventBucket && previousEventBucket.weight_dict) || {};
        const weight_dict = { ...prevWeightDict };

        // If clearing a modality, ensure its weight is removed
        Object.keys(prevWeightDict).forEach((mod) => {
          if (!presentModalities.includes(mod)) {
            delete weight_dict[mod];
          }
        });

        // If current call provided a weight, update it for this modality
        if (
          typeof providedWeight !== "undefined" &&
          Number.isFinite(providedWeight)
        ) {
          weight_dict[type] = Number(providedWeight);
        }

        // Ensure all present modalities have a weight (default 1)
        for (const mod of presentModalities) {
          if (typeof weight_dict[mod] === "undefined") {
            weight_dict[mod] = 1;
          }
        }

        nextEventBucket.weight_dict = weight_dict;
        draft[eventKey] = nextEventBucket;
      } else {
        delete draft[eventKey];
      }

      return draft;
    });
  }, []);

  function handleClear() {
    setSearchData({});
    setResetTrigger((prev) => prev + 1);
    setEvents([1]);
    onClear();
  }

  const handleAddEvent = () => {
    setEvents((previousEvents) => {
      const next = previousEvents.length + 1;
      return [...previousEvents, next];
    });
  };

  const handleRemoveEvent = (event_num) => {
    const prevSnapshot = searchData || {};
    const numericKeys = Object.keys(prevSnapshot)
      .map((k) => Number(k))
      .filter((n) => Number.isInteger(n) && n > 0);
    const maxKey =
      numericKeys.length > 0 ? Math.max(...numericKeys) : events.length || 0;

    // 1) Clear all modalities of the removed stage via updateInput(null)
    const removedKey = String(event_num);
    const removedEvent = prevSnapshot[removedKey] || {};
    if (removedEvent && Object.keys(removedEvent).length > 0) {
      Object.entries(removedEvent).forEach(([type, payload]) => {
        if (type === "weight_dict") return;
        updateInput(event_num, type, null);
      });
    }

    // 2) Shift later stages down by 1 by re-emitting their payloads
    for (let i = event_num + 1; i <= maxKey; i++) {
      const oldKey = String(i);
      const newIndex = i - 1;
      const eventBucket = prevSnapshot[oldKey];
      if (!eventBucket) continue;
      const oldWeights = (eventBucket && eventBucket.weight_dict) || {};
      Object.entries(eventBucket).forEach(([type, payload]) => {
        if (type === "weight_dict") return;
        const weightForType =
          typeof oldWeights[type] !== "undefined"
            ? Number(oldWeights[type])
            : undefined;
        if (payload && typeof payload === "object") {
          const payloadWithWeight = { ...payload };
          if (
            typeof weightForType !== "undefined" &&
            Number.isFinite(weightForType)
          ) {
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
    setEvents((previousEvents) =>
      // Array.from(arrayLike, mapFn)
      Array.from(
        { length: Math.max(0, previousEvents.length - 1) },
        (_, i) => i + 1
      )
    );
  };

  return (
    <div className="search-panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <strong>Event</strong>
        <button
          type="button"
          className="btn-primary"
          onClick={handleAddEvent}
          style={{ padding: "6px 10px", fontSize: 12 }}
        >
          Add Event Search
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        {events.map((event_num, index) => (
          <SearchModalWrapper
            key={event_num}
            event_num={event_num}
            updateInput={updateInput}
            resetTrigger={resetTrigger}
            eventData={searchData[String(event_num)] || {}}
            onRemove={handleRemoveEvent}
            disableRemove={events.length === 1}
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
        const replacer = (key, value) => {
          // Pretty-print File/Blob objects to show name/size/type
          if (typeof File !== "undefined" && value instanceof File) {
            return { name: value.name };
          }
          if (typeof Blob !== "undefined" && value instanceof Blob) {
            return { name: "(blob)" };
          }
          return value;
        };
        return (
          <div
            style={{
              background: "#e9f7ef",
              padding: "15px",
              borderRadius: "8px",
              marginTop: "20px",
              fontSize: "12px",
              color: "#1e7e34",
              border: "1px solid #c3e6cb",
            }}
          >
            <strong>Current Search Data (event_list):</strong>
            <pre>{JSON.stringify({ event_list: searchData }, replacer, 2)}</pre>
          </div>
        );
      })()}
    </div>
  );
}

export default SearchPanel;
