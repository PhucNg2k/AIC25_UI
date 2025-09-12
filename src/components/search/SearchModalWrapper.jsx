import SearchModal from "./SearchModal";
import ImageSearchModal from "./ImageSearchModal";
import SearchModalWrapperHeader from "./SearchModalWrapperHeader";
import { useState, useCallback } from "react";

function SearchModalWrapper({
  stage_num,
  updateInput,
  resetTrigger,
  stageData,
  onRemove,
  disableRemove,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const updateInputForStage = useCallback(
    (...args) => {
      // New API: updateInput(stage, type, data)
      if (args.length === 3) {
        const [s, t, data] = args;
        const sn = Number.isInteger(s) || typeof s === "string" ? s : stage_num;
        return updateInput(sn, t, data);
      }
      // Legacy API: updateInput(type, data) -> inject stage_num
      if (args.length === 2) {
        const [t, data] = args;
        return updateInput(stage_num, t, data);
      }
      console.warn("updateInputForStage called with unexpected args:", args);
    },
    [stage_num, updateInput]
  );

  const handleRemove = useCallback(() => {
    if (onRemove) onRemove(stage_num);
  }, [onRemove, stage_num]);

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
        stage_num={stage_num}
        onToggle={() => setIsCollapsed((v) => !v)}
        isCollapsed={isCollapsed}
        onRemove={handleRemove}
        disableRemove={disableRemove}
      />
      <div style={{ display: isCollapsed ? "none" : "block" }}>
        <SearchModal
          updateInput={updateInputForStage}
          stage_num={stage_num}
          type="text"
          title={`Text Search (Stage ${stage_num})`}
          description="Enter text to find similar video frames"
          placeholder="e.g., a running horse"
          resetTrigger={resetTrigger}
          initialValue={stageData?.text?.value || ""}
          defaultWeightValue={stageData?.weight_dict?.text || 1.0}
          existingObjMask={stageData?.text?.obj_mask || null}
        />

        <ImageSearchModal
          updateInput={updateInputForStage}
          type="img"
          title={`Image Search (Stage ${stage_num})`}
          description="Upload a reference image"
          resetTrigger={resetTrigger}
          initialFile={stageData?.img?.file || null}
          defaultWeightValue={stageData?.weight_dict?.img || 1.0}
        />

        <SearchModal
          updateInput={updateInputForStage}
          stage_num={stage_num}
          type="ocr"
          title={`OCR Search (Stage ${stage_num})`}
          description="Search for text that appears in video frames"
          placeholder="e.g., green farm village"
          resetTrigger={resetTrigger}
          initialValue={stageData?.ocr?.value || ""}
          defaultWeightValue={stageData?.weight_dict?.ocr || 1.0}
          existingObjMask={stageData?.ocr?.obj_mask || null}
        />

        <SearchModal
          updateInput={updateInputForStage}
          stage_num={stage_num}
          type="localized"
          title={`Location Search (Stage ${stage_num})`}
          description="Search by location or place names"
          placeholder="e.g., vietnam"
          resetTrigger={resetTrigger}
          initialValue={stageData?.localized?.value || ""}
          defaultWeightValue={stageData?.weight_dict?.localized || 1.0}
          existingObjMask={stageData?.localized?.obj_mask || null}
        />
      </div>
    </div>
  );
}

export default SearchModalWrapper;
