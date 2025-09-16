import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import "./object_detect.css";
import SelectPanel from "./SelectPanel";
import DrawCanvas from "./DrawCanvas";

/**
 * Props:
 * - event_num, modal                         (required: identify this OD event)
 * - initialObjMask                           (optional: seed)
 * - colorMap                                 (optional)
 * - onUpdateInput(event_num, modal, payload) (optional: live updates as user edits)
 * - onSubmit({event_num, modal, obj_mask})   (optional: called when user clicks Submit)
 * - isSubmitting                             (optional: disable + show progress)
 */
export default function ODPanel({
  event_num,
  modal,
  initialObjMask,
  colorMap = {},
  onUpdateInput,
  onSubmit,
  isSubmitting = false,
}) {
  // Local state: current active class from SelectPanel
  const [activeClass, setActiveClass] = useState({
    class_name: "",
    count_condition: ">0",
    active: false,
  });
  const [choicesState, setChoicesState] = useState([]);

  const handleChangeActiveClass = useCallback((choice) => {
    setActiveClass(
      choice || { class_name: "", count_condition: ">0", active: false }
    );
  }, []);

  // obj_mask state (mirrors your schema)
  const objMaskRef = useRef(
    initialObjMask && typeof initialObjMask === "object"
      ? { ...initialObjMask }
      : {}
  );
  const [objMask, setObjMask] = useState(objMaskRef.current);

  const handleRemoveClass = (className) => {
    const nextMask = { ...objMaskRef.current };
    if (nextMask[className]) {
      delete nextMask[className];
      objMaskRef.current = nextMask;
      setObjMask(nextMask);
      onUpdateInput && onUpdateInput(event_num, modal, { obj_mask: nextMask });
    }
  };

  // Reflect condition changes immediately into obj_mask (for existing classes)
  useEffect(() => {
    if (!choicesState || choicesState.length === 0) return;
    const current = objMaskRef.current || {};
    let changed = false;
    const next = { ...current };
    choicesState.forEach((c) => {
      const name = (c && c.class_name) || "";
      if (!name) return;
      if (next[name]) {
        const newCond = c.count_condition || ">0";
        if (next[name].count_condition !== newCond) {
          next[name] = { ...next[name], count_condition: newCond };
          changed = true;
        }
      }
    });
    if (changed) {
      objMaskRef.current = next;
      setObjMask(next);
      onUpdateInput && onUpdateInput(event_num, modal, { obj_mask: next });
    }
  }, [choicesState, event_num, modal, onUpdateInput]);

  // Called by DrawCanvas whenever boxes change for a class
  const handleRegisterBbox = (className, bboxList) => {
    if (!className || !Array.isArray(bboxList)) return;
    const nextMask = { ...objMaskRef.current };
    // find latest condition for this class in choices, else fall back to activeClass
    const found = (choicesState || []).find((c) => c.class_name === className);
    nextMask[className] = {
      count_condition:
        (found && found.count_condition) ||
        activeClass?.count_condition ||
        ">0",
      bbox: bboxList.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h })),
    };
    objMaskRef.current = nextMask;
    setObjMask(nextMask);
    onUpdateInput && onUpdateInput(event_num, modal, { obj_mask: nextMask });
  };

  // --- Submit handling -------------------------------------------------------
  const canSubmit = useMemo(() => {
    // Allow submit if at least one class has a condition or at least one bbox
    const keys = Object.keys(objMask || {});
    if (keys.length === 0) return false;
    for (const k of keys) {
      const entry = objMask[k] || {};
      if (
        (entry.count_condition && entry.count_condition.trim()) ||
        (Array.isArray(entry.bbox) && entry.bbox.length > 0)
      ) {
        return true;
      }
    }
    return false;
  }, [objMask]);

  const handleSubmit = useCallback(() => {
    if (!onSubmit) return;
    onSubmit({ event_num, modal, obj_mask: objMaskRef.current || {} });
  }, [onSubmit, event_num, modal]);

  // Keyboard shortcut: Ctrl/⌘ + Enter to submit
  useEffect(() => {
    const onKey = (e) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key === "Enter") {
        e.preventDefault();
        if (!isSubmitting && canSubmit) handleSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSubmit, isSubmitting, canSubmit]);

  // Small summary for the footer (count classes / boxes)
  const summary = useMemo(() => {
    const keys = Object.keys(objMask || {});
    let boxes = 0;
    keys.forEach((k) => {
      const b = objMask[k]?.bbox || [];
      boxes += b.length;
    });
    return { classes: keys.length, boxes };
  }, [objMask]);

  return (
    <div className="odpanel">
      <div className="odpanel-card odpanel-left">
        <h4>Classes</h4>
        <SelectPanel
          onChangeActiveClass={handleChangeActiveClass}
          initialChoices={Object.entries(objMaskRef.current || {}).map(
            ([cls, payload]) => ({
              class_name: cls,
              count_condition: payload?.count_condition || ">0",
              active: false,
            })
          )}
          onChoicesChange={setChoicesState}
          onRemoveClass={handleRemoveClass}
          colorMap={colorMap}
        />
      </div>

      <div className="odpanel-card">
        <h4>Canvas</h4>
        <DrawCanvas
          event_num={event_num}
          modal={modal}
          selectedClass={activeClass}
          initialObjMask={initialObjMask}
          objMask={objMask}
          colorMap={colorMap}
          onUpdateBBox={handleRegisterBbox}
        />

        {/* Footer: summary + Submit button */}
        <div
          className="odpanel-footer"
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <div style={{ color: "#6b7280" }}>
            <strong>{summary.classes}</strong> class
            {summary.classes === 1 ? "" : "es"},{" "}
            <strong>{summary.boxes}</strong> box
            {summary.boxes === 1 ? "" : "es"}
          </div>

          <button
            type="button"
            disabled={isSubmitting || !canSubmit}
            onClick={handleSubmit}
            className="btn-primary"
            title={
              canSubmit
                ? "Apply filters and search frames"
                : "Add at least one class or box"
            }
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #111827",
              background: isSubmitting || !canSubmit ? "#e5e7eb" : "#111827",
              color: isSubmitting || !canSubmit ? "#6b7280" : "#fff",
              cursor: isSubmitting || !canSubmit ? "not-allowed" : "pointer",
              fontWeight: 600,
              minWidth: 120,
            }}
          >
            {isSubmitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
