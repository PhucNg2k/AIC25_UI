import { useState, useEffect, useMemo } from "react";
import SubmitAPIHeader from './SubmitAPIHeader';
import '../../styles/SubmitAPIPanel.css';
import SubmitAPIResult from './SubmitAPIResult';
import { prepareKISBody, prepareQABody, prepareTRAKEBody, submitAPI } from "../../utils/api_submit_utils";
import SubmitAPIConfirmModal from './SubmitAPIConfirmModal';

function SubmitAPIPanel ({ 
    queryTask, 
    setQueryTask, 
    submitFrameEntry,
    setSubmittedFrames, 
    onClearSubmissions 
}) {
    const [sessionId, setSessionId] = useState("");
    const [evaluationId, setEvaluationId] = useState("");
    const [placeholderValue, setPlaceholderValue] = useState("");
    const [manualBodyOverride, setManualBodyOverride] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [responseData, setResponseData] = useState(null);
    const [previewRequest, setPreviewRequest] = useState(null);

    const handleSessionIdChange = (newSessionId) => {
        setSessionId(newSessionId);
    };

    const handleEvaluationIdChange = (newEvaluationId) => {
        setEvaluationId(newEvaluationId);
    };

    const BASE_URL = "https://eventretrieval.oj.io.vn/api/v2"; // kept for consistency in file

    // Build body like the preview to validate readiness - memoized to prevent unnecessary recalculations
    const previewBody = useMemo(() => {
        // Use manual override if provided
        if (manualBodyOverride !== null) {
            return manualBodyOverride;
        }
        
        if (!Array.isArray(submitFrameEntry) || submitFrameEntry.length === 0) return null;
        const first = submitFrameEntry[0];
        try {
            if (queryTask === 'kis' && first) {
                return prepareKISBody(first);
            } else if (queryTask === 'qa' && first) {
                const qaItem = { ...first };
                if (!qaItem.answer) qaItem.answer = placeholderValue;
                return prepareQABody(qaItem);
            } else if (queryTask === 'trake') {
                const videoName = submitFrameEntry[0]?.video_name || first?.video_name;
                const merged = new Set();
                submitFrameEntry.forEach((entry) => {
                    if (entry && Array.isArray(entry.frames)) {
                        entry.frames.forEach((f) => merged.add(Number(f)));
                    }
                });
                const mergedEntry = { video_name: videoName, frames: Array.from(merged).sort((a, b) => a - b) };
                return prepareTRAKEBody(mergedEntry);
            }
        } catch (_) {
            return null;
        }
        return null;
    }, [queryTask, submitFrameEntry, placeholderValue, manualBodyOverride]);

    // Create previewRequest object - memoized to prevent unnecessary recreations
    const currentPreviewRequest = useMemo(() => {
        if (evaluationId && sessionId && previewBody) {
            const url = `${BASE_URL}/submit/${evaluationId}`;
            const method = 'POST';
            const params = { session: sessionId };
            return { url, method, params, body: previewBody };
        }
        return null;
    }, [evaluationId, sessionId, previewBody, BASE_URL]);

    // Update previewRequest state when the memoized value changes
    useEffect(() => {
        setPreviewRequest(currentPreviewRequest);
    }, [currentPreviewRequest]);

    // Clear manual body override when task changes or submissions are cleared
    useEffect(() => {
        setManualBodyOverride(null);
    }, [queryTask, submitFrameEntry]);

    // Clear response data when previewRequest changes (new data)
    useEffect(() => {
        setResponseData(null);
        // Close modal if preview request becomes invalid
        if (!currentPreviewRequest && isConfirmOpen) {
            setIsConfirmOpen(false);
        }
    }, [currentPreviewRequest, isConfirmOpen]);

    let waitTime = 10000;

    return (
        <div className="submit-panel">
            <SubmitAPIHeader 
                queryTask={queryTask}
                setQueryTask={setQueryTask}
                onSessionIdChange={handleSessionIdChange}
                onEvaluationIdChange={handleEvaluationIdChange}
                onResetSelection={() => onClearSubmissions()}
            />



            {/*Display final request */}
            <SubmitAPIResult
                queryTask={queryTask}
                submitFrameEntry={submitFrameEntry}
                sessionId={sessionId}
                evaluationId={evaluationId}
                placeholderValue={placeholderValue}
                onPlaceholderChange={setPlaceholderValue}
                onResetTrake={() => onClearSubmissions()}
                onBodyChange={setManualBodyOverride}
            />

            {/*Submit Button */}
            {currentPreviewRequest ? (
                <div style={{ marginTop: 12 }}>
                    <button
                        type="button"
                        className="export-btn"
                        onClick={() => {
                            setResponseData(null);
                            setIsConfirmOpen(true);
                        }}
                        title={'Open confirmation'}
                    >
                        Open Confirmation
                    </button>
                </div>
            ) : null}

            <SubmitAPIConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                previewRequest={previewRequest}
                sending={sending}
                responseData={responseData}
                onSend={async () => {
                    if (!previewRequest?.body) return;
                    setSending(true);
                    // Auto-close ONLY if no response arrives within waitTime
                    const watchdog = setTimeout(() => setIsConfirmOpen(false), waitTime);
                    try {
                        const resp = await submitAPI(evaluationId, sessionId, previewRequest.body);
                        clearTimeout(watchdog);
                        setResponseData(resp); // Show response; user will close manually
                    } catch (err) {
                        clearTimeout(watchdog);
                        setResponseData({ error: err?.message || String(err) }); // Keep open for manual close
                    } finally {
                        setSending(false);
                    }
                }}
            />

            {/*Request confirmation modal */}
        </div>
    )
}

export default SubmitAPIPanel