import { useState, useEffect, useRef } from "react";
import ODPanel from "../object_detect/ODPanel";
import colorMap from "../object_detect/color_map";
import "../../styles/SearchModal.css";

function SearchModal({
  updateInput, // callback to send updated search values to parent
  event_num, // identifies which event this modal belongs to
  type, // modality type (text, ocr, img, localized, etc.)
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

  const [odSubmitting, setOdSubmitting] = useState(false);
  const [showODPanel, setShowODPanel] = useState(false);

  const hasValue = !!(inputValue && inputValue.trim());
  const hasObjMask = !!(
    existingObjMask &&
    typeof existingObjMask === "object" &&
    Object.keys(existingObjMask).length > 0
  );

  const handleOpenCanvas = () => {
    if (!hasValue) return;
    setShowODPanel(true);
  };

  // Reset input when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setInputValue("");
      setWeightValue("1");
      updateInput(event_num, type, null);
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
    updateInput(event_num, type, {
      value,
      weight: Number(weightValue) || 1,
    });
  };

  const handleWeightChange = (e) => {
    const raw = e.target.value;
    setWeightValue(raw);
    const numeric = Number(raw);
    if (inputValue && inputValue.trim()) {
      updateInput(event_num, type, {
        value: inputValue,
        weight: Number.isFinite(numeric) ? numeric : 1,
      });
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleBlur = () => setIsFocused(false);

  const handleClear = () => {
    setInputValue("");
    setWeightValue("1");
    updateInput(event_num, type, null);
  };

  return (
    <div className={`search-modal ${hasValue ? "" : "dimmed"}`}>
      <div className="search-header">
        <h2>{title}</h2>
      </div>

      <div className="search-container">
        <div className="search-input-group">
          <label htmlFor={`search-input-${type}`}>Search Query</label>

          {!isFocused ? (
            <div className="search-display" onClick={handleFocus}>
              {inputValue || placeholder}
            </div>
          ) : (
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

          {hasValue ? (
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
                Object Mask - Event {event_num} / {type}
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
                stage_num={event_num}
                modal={type}
                initialObjMask={existingObjMask}
                colorMap={colorMap}
                onUpdateInput={(en, modal, payload) => {
                  if (en === event_num && modal === type) {
                    const merged = {
                      value: inputValue || "",
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
                    updateInput(event_num, type, merged);
                  }
                }}
                onSubmit={({ event_num: en, modal: m, obj_mask }) => {
                  if (m !== type) return;
                  setOdSubmitting(true);
                  const merged = {
                    value: inputValue || "",
                    weight: Number(weightValue) || 1,
                    obj_mask,
                  };
                  updateInput(en, type, merged);
                  setShowODPanel(false);
                  setOdSubmitting(false);
                }}
                isSubmitting={odSubmitting}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SearchModal;
