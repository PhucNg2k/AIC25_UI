import { useEffect, useMemo, useState } from "react";
import { prepareKISBody, prepareQABody, prepareTRAKEBody } from "../../utils/api_submit_utils";

function SubmitAPIResult({
  queryTask,
  submitFrameEntry,
  sessionId,
  evaluationId,
  placeholderValue,
  onPlaceholderChange,
  onResetTrake,
  onBodyChange,
}) {
  const [manualBodyOverride, setManualBodyOverride] = useState(null);
  const [isEditingBody, setIsEditingBody] = useState(false);
  const BASE_URL = "https://eventretrieval.oj.io.vn/api/v2";

  const firstEntrySignature = useMemo(() => {
    try {
      return JSON.stringify(submitFrameEntry?.[0] || null);
    } catch (_) {
      return String(submitFrameEntry?.length || 0);
    }
  }, [submitFrameEntry]);

  useEffect(() => {
    if (queryTask === "qa") {
      const first = Array.isArray(submitFrameEntry) ? submitFrameEntry[0] : null;
      if (first && typeof first.answer !== "undefined") {
        onPlaceholderChange && onPlaceholderChange(first.answer || "");
      }
    }
  }, [queryTask, submitFrameEntry, onPlaceholderChange]);

  // Ensure edit mode never blocks new submit/reset: when input set changes, clear edit state
  useEffect(() => {
    setIsEditingBody(false);
    setManualBodyOverride(null);
  }, [firstEntrySignature, queryTask]);

  

  const { url, method, params, body } = useMemo(() => {
    const method = "POST";
    const url = `${BASE_URL}/submit/${evaluationId || "<evaluationId>"}`;
    const params = { session: sessionId || "<sessionId>" };

    // Use manual override if provided (and saved)
    if (manualBodyOverride !== null && !isEditingBody) {
      try {
        const parsed = typeof manualBodyOverride === 'string' 
          ? JSON.parse(manualBodyOverride) 
          : manualBodyOverride;
        return { url, method, params, body: parsed };
      } catch (_) {
        // Invalid JSON, fall through to auto-generate
      }
    }

    let body = null;
    if (Array.isArray(submitFrameEntry) && submitFrameEntry.length > 0) {
      try {
        const first = submitFrameEntry[0];
        if (queryTask === "kis" && first) {
          body = prepareKISBody(first);
        } else if (queryTask === "qa" && first) {
          const qaItem = { ...first };
          if (!qaItem.answer) qaItem.answer = placeholderValue;
          body = prepareQABody(qaItem);
        } else if (queryTask === "trake") {
          const videoName = submitFrameEntry[0]?.video_name || first?.video_name;
          const merged = new Set();
          submitFrameEntry.forEach((entry) => {
            if (entry && Array.isArray(entry.frames)) {
              entry.frames.forEach((f) => merged.add(Number(f)));
            }
          });
          const mergedEntry = {
            video_name: videoName,
            frames: Array.from(merged).sort((a, b) => a - b),
          };
          body = prepareTRAKEBody(mergedEntry);
        }
      } catch (_) {
        body = null;
      }
    }

    return { url, method, params, body };
  }, [BASE_URL, evaluationId, sessionId, firstEntrySignature, queryTask, placeholderValue, submitFrameEntry, manualBodyOverride, isEditingBody]);

  // Reset manual override when frames change (unless actively editing)
  useEffect(() => {
    if (!isEditingBody && manualBodyOverride !== null) {
      // Keep manual override, don't reset
      return;
    }
    if (!isEditingBody) {
      setManualBodyOverride(null);
    }
  }, [firstEntrySignature, isEditingBody]);

  return (
    <div className="request-preview">
      <strong>Request Preview</strong>
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <button
            type="button"
            onClick={() => {
              // Local clear so edit mode doesn't block resets
              setIsEditingBody(false);
              setManualBodyOverride(null);
              if (onPlaceholderChange) onPlaceholderChange("");
              onResetTrake && onResetTrake();
            }}
            title="Clear current selection"
            style={{
              padding: '6px 10px',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid #dc3545',
              background: '#fff',
              color: '#dc3545',
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </div>
        <div>
          <b>URL</b>: <span style={{ wordBreak: "break-all" }}>{url}</span>
        </div>
        <div>
          <b>Method</b>: {method}
        </div>
        <div>
          <b>Params</b>:
        </div>
        <pre>{JSON.stringify(params, null, 2)}</pre>
        {queryTask === "qa" && (
          <div>
            <label htmlFor="qa-placeholder" style={{ fontSize: 12, color: "#495057" }}>
              QA Answer (placeholder)
            </label>
            <input
              id="qa-placeholder"
              type="text"
              value={placeholderValue}
              onChange={(e) => onPlaceholderChange && onPlaceholderChange(e.target.value)}
              placeholder="Enter answer to include in body"
            />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <b>Body</b>:
          {!isEditingBody && body && (
            <button
              type="button"
              onClick={() => {
                setIsEditingBody(true);
                setManualBodyOverride(JSON.stringify(body, null, 2));
              }}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: 4,
                border: '1px solid #007bff',
                background: '#fff',
                color: '#007bff',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
          )}
          {isEditingBody && (
            <button
              type="button"
              onClick={() => {
                setIsEditingBody(false);
                try {
                  const parsed = typeof manualBodyOverride === 'string' 
                    ? JSON.parse(manualBodyOverride) 
                    : manualBodyOverride;
                  if (onBodyChange) {
                    onBodyChange(parsed);
                  }
                  // Keep the parsed value for display
                  setManualBodyOverride(parsed);
                } catch (e) {
                  alert("Invalid JSON. Please fix the syntax.");
                  console.error("JSON parse error:", e);
                  setIsEditingBody(true); // Stay in edit mode
                }
              }}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: 4,
                border: '1px solid #28a745',
                background: '#fff',
                color: '#28a745',
                cursor: 'pointer',
                marginRight: 4
              }}
            >
              Save
            </button>
          )}
          {isEditingBody && (
            <button
              type="button"
              onClick={() => {
                setIsEditingBody(false);
                setManualBodyOverride(null);
              }}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: 4,
                border: '1px solid #dc3545',
                background: '#fff',
                color: '#dc3545',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </div>
        {isEditingBody ? (
          <textarea
            value={typeof manualBodyOverride === 'string' ? manualBodyOverride : JSON.stringify(manualBodyOverride || body || {}, null, 2)}
            onChange={(e) => setManualBodyOverride(e.target.value)}
            placeholder='{"answerSets": [...]}'
            style={{
              width: '100%',
              minHeight: '200px',
              fontFamily: 'monospace',
              fontSize: 12,
              padding: 8,
              border: '1px solid #ced4da',
              borderRadius: 4,
              whiteSpace: 'pre',
              overflowWrap: 'normal',
              overflowX: 'auto'
            }}
            onFocus={() => setIsEditingBody(true)}
          />
        ) : (
          <pre>{body ? JSON.stringify(body, null, 2) : "// Select a frame/group to preview body"}</pre>
        )}
      </div>
    </div>
  );
}

export default SubmitAPIResult;


