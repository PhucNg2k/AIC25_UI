import { useEffect, useMemo } from "react";
import { prepareKISBody, prepareQABody, prepareTRAKEBody } from "../../utils/api_submit_utils";

function SubmitAPIResult({
  queryTask,
  submitFrameEntry,
  sessionId,
  evaluationId,
  placeholderValue,
  onPlaceholderChange,
  onResetTrake,
}) {
  const BASE_URL = "https://eventretrieval.oj.io.vn/api/v2";

  useEffect(() => {
    if (queryTask === "qa") {
      const first = Array.isArray(submitFrameEntry) ? submitFrameEntry[0] : null;
      if (first && typeof first.answer !== "undefined") {
        onPlaceholderChange && onPlaceholderChange(first.answer || "");
      }
    }
  }, [queryTask, submitFrameEntry, onPlaceholderChange]);

  const firstEntrySignature = useMemo(() => {
    try {
      return JSON.stringify(submitFrameEntry?.[0] || null);
    } catch (_) {
      return String(submitFrameEntry?.length || 0);
    }
  }, [submitFrameEntry]);

  const { url, method, params, body } = useMemo(() => {
    const method = "POST";
    const url = `${BASE_URL}/submit/${evaluationId || "<evaluationId>"}`;
    const params = { session: sessionId || "<sessionId>" };

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
  }, [BASE_URL, evaluationId, sessionId, firstEntrySignature, queryTask, placeholderValue, submitFrameEntry]);

  return (
    <div className="request-preview">
      <strong>Request Preview</strong>
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <button
            type="button"
            onClick={() => onResetTrake && onResetTrake()}
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
        <div>
          <b>Body</b>:
        </div>
        <pre>{body ? JSON.stringify(body, null, 2) : "// Select a frame/group to preview body"}</pre>
      </div>
    </div>
  );
}

export default SubmitAPIResult;


