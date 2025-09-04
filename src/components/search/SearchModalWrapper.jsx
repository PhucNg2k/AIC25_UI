import SearchModal from "./SearchModal";
import ImageSearchModal from "./ImageSearchModal";
import SearchModalWrapperHeader from "./SearchModalWrapperHeader";
import { useState, useCallback } from "react";

function SearchModalWrapper({ stage_num, updateInput, resetTrigger, onRemove, disableRemove }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const updateInputForStage = useCallback((type, inputData) => {
    updateInput(stage_num, type, inputData);
  }, [stage_num, updateInput]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
      <SearchModalWrapperHeader
        stage_num={stage_num}
        onToggle={() => setIsCollapsed((v) => !v)}
        isCollapsed={isCollapsed}
        onRemove={onRemove ? () => onRemove(stage_num) : undefined}
        disableRemove={disableRemove}
      />
      {!isCollapsed && (
        <>
      <SearchModal
        updateInput={updateInputForStage}
        type="text"
        title={`Text Search (Stage ${stage_num})`}
        description="Enter text to find similar video frames"
        placeholder="e.g., a running horse"
        resetTrigger={resetTrigger}
      />

      <ImageSearchModal
        updateInput={updateInputForStage}
        type="img"
        title={`Image Search (Stage ${stage_num})`}
        description="Upload a reference image"
        resetTrigger={resetTrigger}
      />

      <SearchModal
        updateInput={updateInputForStage}
        type="ocr"
        title={`OCR Search (Stage ${stage_num})`}
        description="Search for text that appears in video frames"
        placeholder="e.g., green farm village"
        resetTrigger={resetTrigger}
      />

      <SearchModal
        updateInput={updateInputForStage}
        type="localized"
        title={`Location Search (Stage ${stage_num})`}
        description="Search by location or place names"
        placeholder="e.g., vietnam"
        resetTrigger={resetTrigger}
      />
        </>
      )}
    </div>
  );
}

export default SearchModalWrapper;


