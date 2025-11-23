// ClassChoice.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import COCO_CLASSES from "./cocoClasses";

export default function ClassChoice({
  classNameValue = "",
  onChangeClass,
  conditionValue = ">0",
  onChangeCondition,
  posActive = false,
  onTogglePos,
  disallowedClasses = [],
  colorHex = "#f8f9fa",
}) {
  const [findQuery, setFindQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const findBoxRef = useRef(null);
  const listRef = useRef(null);

  // Block list (case-insensitive)
  const isDisallowed = (name) => {
    if (!name) return false;
    return disallowedClasses
      .map((c) => (c || "").toLowerCase())
      .includes(name.toLowerCase());
  };

  // Filtered COCO classes
  const filtered = useMemo(() => {
    const q = (findQuery || "").trim().toLowerCase();
    let base = COCO_CLASSES.filter(
      (opt) => !isDisallowed(opt) || opt === classNameValue
    );
    if (!q) return base.slice(0, 50); // cap for perf
    return base
      .map((opt) => [opt, opt.toLowerCase().indexOf(q)])
      .filter(([, idx]) => idx >= 0)
      .sort((a, b) => a[1] - b[1]) // earlier match first
      .map(([opt]) => opt)
      .slice(0, 50);
  }, [findQuery, classNameValue, disallowedClasses]);

  useEffect(() => {
    if (activeIdx >= filtered.length) setActiveIdx(0);
  }, [filtered.length, activeIdx]);

  // Keyboard navigation for the popover
  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(
        (i) =>
          (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = filtered[activeIdx];
      if (chosen && onChangeClass) onChangeClass(chosen);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const choose = (name) => {
    if (onChangeClass) onChangeClass(name);
    setFindQuery("");
    setOpen(false);
    // focus next input for speed
    setTimeout(() => {
      document.querySelector("#condition-input")?.focus();
    }, 0);
  };

  return (
    <div
      className="class-choice"
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Color block + selected class */}
      <div
        className="class-color"
        style={{
          background: colorHex,
          minWidth: 200,
          padding: "6px 8px",
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Class:</span>
          <input
            id="class-name"
            value={classNameValue}
            onChange={(e) => onChangeClass && onChangeClass(e.target.value)}
            placeholder="Selected class..."
            className="class-input"
            style={{ padding: "6px 8px", width: 180 }}
          />
        </div>
      </div>

      {/* FIND (type-ahead) */}
      <div style={{ position: "relative" }}>
        <input
          ref={findBoxRef}
          aria-label="Find class"
          value={findQuery}
          onChange={(e) => {
            setFindQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Find class… (type to filter)"
          style={{
            padding: "6px 10px",
            width: 220,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />
        {open && (
          <div
            ref={listRef}
            className="class-find-popover"
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              width: 320,
              maxHeight: 260,
              overflowY: "auto",
              background: "#fff",
              border: "1px solid #e5e7eb",
              boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
              borderRadius: 10,
              zIndex: 10,
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: 12, color: "#6b7280" }}>No matches</div>
            ) : (
              filtered.map((opt, i) => (
                <div
                  key={opt}
                  onClick={() => choose(opt)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`class-item ${i === activeIdx ? "active" : ""}`}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    background: i === activeIdx ? "#f3f4f6" : "transparent",
                    fontWeight: opt === classNameValue ? 600 : 400,
                  }}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Count condition + POS toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label htmlFor="condition-input" style={{ fontWeight: 600 }}>
          Condition:
        </label>
        <input
          type="text"
          id="condition-input"
          value={conditionValue}
          onChange={(e) =>
            onChangeCondition && onChangeCondition(e.target.value)
          }
          placeholder=">0, >=2, ==1…"
          style={{
            padding: "6px 8px",
            width: 110,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />
        <button
          type="button"
          onClick={() => onTogglePos && onTogglePos()}
          className={`pos-btn ${posActive ? "active" : ""}`}
          title="Activate class for drawing"
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: posActive ? "#111827" : "#fff",
            color: posActive ? "#fff" : "#111827",
          }}
        >
          POS
        </button>
      </div>
    </div>
  );
}
