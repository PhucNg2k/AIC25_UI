import { useState, useEffect, useRef } from "react";
import ODPanel from "../object_detect/ODPanel";
import colorMap from "../object_detect/color_map";
import "../../styles/SearchModal.css";

function SearchModal({
  updateInput, // callback to send updated search values to parent
  stage_num, // identifies which stage this modal belongs to
  type, // modality type (text, ocr, img, etc.)
  title, // header text
  description, // extra info (not directly used in code)
  placeholder, // shown when empty
  resetTrigger, // when incremented, resets the input
  defaultWeightValue, // initial weight (0–1)
  initialValue = "", // prefilled search value
  existingObjMask = null, // pre-existing object mask (if any)
}) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [weightValue, setWeightValue] = useState(defaultWeightValue);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const [showODPanel, setShowODPanel] = useState(false);
  const handleOpenCanvas = () => {
    if (!hasValue) return;
    setShowODPanel(true);
  };

  // Reset input when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      // Only trigger on actual reset, not initial load
      setInputValue("");
      setWeightValue("1");
      // Only clear once per resetTrigger bump to avoid loops
      // updateInput(type, null)
      updateInput(stage_num, type, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger, type]);

  useEffect(() => {
    setInputValue(initialValue || "");
  }, [initialValue]);

  useEffect(() => {
    if (typeof defaultWeightValue !== "undefined") {
      setWeightValue(defaultWeightValue);
    }
  }, [defaultWeightValue]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Always call updateInput, let SearchPanel decide what to do
    // updateInput(type, { value: value, weight: Number(weightValue) || 1 })
    updateInput(stage_num, type, {
      value: value,
      weight: Number(weightValue) || 1,
    });
  };

  const handleWeightChange = (e) => {
    const raw = e.target.value;
    setWeightValue(raw);
    const numeric = Number(raw);
    if (inputValue && inputValue.trim()) {
      // updateInput(type, { value: inputValue, weight: Number.isFinite(numeric) ? numeric : 1 })
      updateInput(stage_num, type, {
        value: inputValue,
        weight: Number.isFinite(numeric) ? numeric : 1,
      });
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Focus the textarea after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleClear = () => {
    setInputValue("");
    setWeightValue("1");
    // updateInput(type, null)
    updateInput(stage_num, type, null);
  };

  const hasValue = !!(inputValue && inputValue.trim());
  const hasObjMask = !!(
    existingObjMask &&
    typeof existingObjMask === "object" &&
    Object.keys(existingObjMask).length > 0
  );

  return (
    <div className={`search-modal ${hasValue ? "" : "dimmed"}`}>
      <div className="search-header">
        <h2>{title}</h2>
      </div>

      <div className="search-container">
        <div className="search-input-group">
          <label htmlFor={`search-input-${type}`}>Search Query</label>

          {!isFocused ? (
            // Display mode - show full content in a div
            <div className="search-display" onClick={handleFocus}>
              {inputValue || placeholder}
            </div>
          ) : (
            // Edit mode - normal textarea
            <textarea
              ref={textareaRef}
              id={`search-input-${type}`}
              placeholder={placeholder}
              autoComplete="off"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              rows={3}
              className="search-textarea"
            />
          )}
          {inputValue ? (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClear}
                style={{ padding: "4px 8px", fontSize: 12 }}
              >
                Remove
              </button>
            </div>
          ) : null}
        </div>

        <div
          className="search-input-group"
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <label
            htmlFor={`weight-input-${type}`}
            style={{ marginBottom: 0, minWidth: "auto" }}
          >
            Weight:
          </label>
          <input
            id={`weight-input-${type}`}
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={weightValue}
            onChange={handleWeightChange}
            style={{ width: "80px" }}
          />
          <button
            type="button"
            className="btn-secondary"
            style={{
              padding: "6px 10px",
              fontSize: 12,
              opacity: hasValue ? 1 : 0.5,
              cursor: hasValue ? "pointer" : "not-allowed",
              border: hasObjMask ? "2px solid black" : undefined,
            }}
            onClick={handleOpenCanvas}
            title={
              hasValue
                ? "Open object mask panel"
                : "Enter a value first to enable object mask"
            }
            disabled={!hasValue}
          >
            Obj mask
          </button>
        </div>
      </div>
      {showODPanel ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowODPanel(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              width: "min(1200px, 96vw)",
              height: "min(820px, 92vh)",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderBottom: "1px solid #e9ecef",
              }}
            >
              <h4 style={{ margin: 0 }}>
                Object Mask - Stage {stage_num} / {type}
              </h4>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowODPanel(false)}
                style={{ padding: "6px 10px" }}
                title="Close"
              >
                Close
              </button>
            </div>
            <div
              style={{
                padding: 12,
                height: "calc(100% - 48px)",
                overflow: "hidden",
              }}
            >
              <ODPanel
                stage_num={stage_num}
                modal={type}
                initialObjMask={existingObjMask}
                colorMap={colorMap}
                onUpdateInput={(sn, modal, payload) => {
                  if (sn === stage_num && modal === type) {
                    const merged = {
                      ...((initialValue && { value: initialValue }) || {}),
                      ...payload,
                      weight: Number(weightValue) || 1,
                    };
                    if (
                      merged.obj_mask &&
                      typeof merged.obj_mask === "object" &&
                      Object.keys(merged.obj_mask).length === 0
                    ) {
                      delete merged.obj_mask;
                    }
                    // updateInput(type, merged);
                    updateInput(stage_num, type, merged);
                  }
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SearchModal;
