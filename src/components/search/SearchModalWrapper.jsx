// components/search/SearchModalWrapper.jsx
import SearchModal from "./SearchModal";
import ImageSearchModal from "./ImageSearchModal";
import SearchModalWrapperHeader from "./SearchModalWrapperHeader";
import { useState, useCallback, useMemo } from "react";
import ObjectSearchModal from "./ObjectSearchModal"; // NEW

const TABS = [
  { key: "text", label: "Text" },
  { key: "img", label: "Image" },
  { key: "ocr", label: "OCR" },
  { key: "asr", label: "ASR" },
  { key: "localized", label: "Localized" },
  { key: "od", label: "OD" }, // Object Detection filter
];

function SearchModalWrapper({
  event_num,
  updateInput,
  resetTrigger,
  eventData,
  onRemove,
  disableRemove,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState("text");

  const updateInputForEvent = useCallback(
    (...args) => {
      if (args.length === 3) {
        const [e, t, data] = args;
        const en = Number.isInteger(e) || typeof e === "string" ? e : event_num;
        return updateInput(en, t, data);
      }
      if (args.length === 2) {
        const [t, data] = args;
        return updateInput(event_num, t, data);
      }
      console.warn("updateInputForEvent called with unexpected args:", args);
    },
    [event_num, updateInput]
  );

  const handleRemove = useCallback(() => {
    if (onRemove) onRemove(event_num);
  }, [onRemove, event_num]);

  // read weights & existing values for each tab from eventData (unchanged data model)
  const weights = useMemo(
    () => eventData?.weight_dict || {},
    [eventData?.weight_dict]
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 12,
      }}
    >
      <SearchModalWrapperHeader
        event_num={event_num}
        onToggle={() => setIsCollapsed((v) => !v)}
        isCollapsed={isCollapsed}
        onRemove={handleRemove}
        disableRemove={disableRemove}
      />

      {/* Tab strip */}
      <div style={{ display: isCollapsed ? "none" : "block" }}>
        <div
          role="tablist"
          aria-label={`Search types for Event ${event_num}`}
          style={{
            display: "flex",
            gap: 8,
            borderBottom: "1px solid #eee",
            paddingBottom: 8,
            marginBottom: 12,
            overflowX: "auto",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={activeTab === t.key}
              onClick={() => setActiveTab(t.key)}
              className="btn-secondary"
              style={{
                padding: "6px 10px",
                fontSize: 12,
                border:
                  activeTab === t.key ? "2px solid #111" : "1px solid #ddd",
                background: activeTab === t.key ? "#fff" : "#f8f9fa",
                borderRadius: 6,
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Active panel */}
        {activeTab === "text" && (
          <SearchModal
            updateInput={updateInputForEvent}
            event_num={event_num}
            type="text"
            title={`Text Search (Event ${event_num})`}
            description="Enter text to find similar video frames"
            placeholder="e.g., a running horse"
            resetTrigger={resetTrigger}
            initialValue={eventData?.text?.value || ""}
            defaultWeightValue={weights?.text ?? 1.0}
            existingObjMask={eventData?.text?.obj_mask || null}
          />
        )}

        {activeTab === "img" && (
          <ImageSearchModal
            updateInput={updateInputForEvent}
            type="img"
            title={`Image Search (Event ${event_num})`}
            description="Upload a reference image"
            resetTrigger={resetTrigger}
            initialFile={eventData?.img?.file || null}
            defaultWeightValue={weights?.img ?? 1.0}
          />
        )}

        {activeTab === "ocr" && (
          <SearchModal
            updateInput={updateInputForEvent}
            event_num={event_num}
            type="ocr"
            title={`OCR Search (Event ${event_num})`}
            description="Search for text visible in frames"
            placeholder="e.g., green farm village"
            resetTrigger={resetTrigger}
            initialValue={eventData?.ocr?.value || ""}
            defaultWeightValue={weights?.ocr ?? 1.0}
            existingObjMask={eventData?.ocr?.obj_mask || null}
          />
        )}

        {activeTab === "asr" && (
          <SearchModal
            updateInput={updateInputForEvent}
            event_num={event_num}
            type="asr"
            title={`ASR Search (Event ${event_num})`}
            description="Search by spoken words (transcripts)"
            placeholder="e.g., 'the mayor announced...'"
            resetTrigger={resetTrigger}
            initialValue={eventData?.asr?.value || ""}
            defaultWeightValue={weights?.asr ?? 1.0}
            existingObjMask={eventData?.asr?.obj_mask || null}
          />
        )}

        {activeTab === "localized" && (
          <SearchModal
            updateInput={updateInputForEvent}
            event_num={event_num}
            type="localized"
            title={`Localized Search (Event ${event_num})`}
            description="Search by localized region features"
            placeholder="e.g., vietnam"
            resetTrigger={resetTrigger}
            initialValue={eventData?.localized?.value || ""}
            defaultWeightValue={weights?.localized ?? 1.0}
            existingObjMask={eventData?.localized?.obj_mask || null}
          />
        )}

        {activeTab === "od" && (
          <ObjectSearchModal
            event_num={event_num}
            updateInput={updateInputForEvent}
            resetTrigger={resetTrigger}
            initialValue={eventData?.od || { classes: [], count: "", pos: "" }}
            defaultWeightValue={weights?.od ?? 1.0}
          />
        )}
      </div>
    </div>
  );
}

export default SearchModalWrapper;
