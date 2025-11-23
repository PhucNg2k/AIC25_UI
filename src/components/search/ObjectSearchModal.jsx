// components/search/ObjectSearchModal.jsx
import { useEffect, useState } from "react";

export default function ObjectSearchModal({
  event_num,
  updateInput, // updateInput(event_num, 'od', payload)
  resetTrigger,
  initialValue = { classes: [], count: "", pos: "" },
  defaultWeightValue = 1.0,
}) {
  const [classes, setClasses] = useState(initialValue.classes || []);
  const [count, setCount] = useState(initialValue.count || "");
  const [pos, setPos] = useState(initialValue.pos || "");
  const [weightValue, setWeightValue] = useState(defaultWeightValue);

  useEffect(() => {
    if (resetTrigger > 0) {
      setClasses([]);
      setCount("");
      setPos("");
      setWeightValue(1);
      updateInput(event_num, "od", null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger]);

  // emit a compact payload; backend already knows how to use it
  const emit = (next = {}) => {
    const payload = {
      classes,
      count: count !== "" ? Number(count) : undefined,
      pos: pos || undefined, // e.g., "left", "center", "top-right"
      weight: Number(weightValue) || 1,
    };
    updateInput(event_num, "od", { ...payload, ...next });
  };

  const toggleClass = (c) => {
    const next = classes.includes(c)
      ? classes.filter((x) => x !== c)
      : [...classes, c];
    setClasses(next);
    emit({ classes: next });
  };

  const COMMON = [
    "person",
    "car",
    "dog",
    "cat",
    "bus",
    "bicycle",
    "motorcycle",
    "chair",
    "bottle",
    "tv",
    "laptop",
  ];

  return (
    <div className="search-modal">
      <div className="search-header">
        <h2>Object Detection Filter (Event {event_num})</h2>
      </div>

      <div className="search-container">
        <div className="search-input-group">
          <label>Classes (toggle):</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {COMMON.map((c) => (
              <button
                key={c}
                type="button"
                className="btn-secondary"
                onClick={() => toggleClass(c)}
                style={{
                  padding: "4px 8px",
                  fontSize: 12,
                  border: classes.includes(c)
                    ? "2px solid #111"
                    : "1px solid #ddd",
                  background: classes.includes(c) ? "#fff" : "#f8f9fa",
                  borderRadius: 6,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="search-input-group" style={{ marginTop: 12 }}>
          <label htmlFor={`od-count-${event_num}`}>Min Count (optional):</label>
          <input
            id={`od-count-${event_num}`}
            type="number"
            min={0}
            step={1}
            value={count}
            onChange={(e) => {
              setCount(e.target.value);
              emit({ count: Number(e.target.value) });
            }}
            style={{ width: 120 }}
          />
        </div>

        <div className="search-input-group" style={{ marginTop: 12 }}>
          <label htmlFor={`od-pos-${event_num}`}>Position (optional):</label>
          <input
            id={`od-pos-${event_num}`}
            type="text"
            placeholder="e.g., left, center, top-right"
            value={pos}
            onChange={(e) => {
              setPos(e.target.value);
              emit({ pos: e.target.value });
            }}
          />
        </div>

        <div
          className="search-input-group"
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <label style={{ marginBottom: 0, minWidth: "auto" }}>Weight:</label>
          <input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={weightValue}
            onChange={(e) => {
              setWeightValue(e.target.value);
              emit({ weight: Number(e.target.value) || 1 });
            }}
            style={{ width: 80 }}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => updateInput(event_num, "od", null)}
            style={{ padding: "4px 8px", fontSize: 12, marginLeft: 8 }}
            title="Remove OD filter for this event"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
