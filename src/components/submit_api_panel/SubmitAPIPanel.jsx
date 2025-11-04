import { useState } from "react";
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

    // Build body like the preview to validate readiness
    const previewBody = (() => {
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
    })();

    return (
        <div className="submit-panel">
            <SubmitAPIHeader 
                queryTask={queryTask}
                setQueryTask={setQueryTask}
                onSessionIdChange={handleSessionIdChange}
                onEvaluationIdChange={handleEvaluationIdChange}
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
            />

            {/*Submit Button */}
            <div style={{ marginTop: 12 }}>
                <button
                    type="button"
                    className="export-btn"
                    onClick={() => {
                        const body = previewBody;
                        const url = `${BASE_URL}/submit/${evaluationId || '<evaluationId>'}`;
                        const method = 'POST';
                        const params = { session: sessionId || '<sessionId>' };
                        setPreviewRequest({ url, method, params, body });
                        setResponseData(null);
                        setIsConfirmOpen(true);
                    }}
                    disabled={!evaluationId || !sessionId || !previewBody}
                    title={!evaluationId || !sessionId ? 'Login and fetch evaluation ID first' : (!previewBody ? 'Provide a valid body' : 'Open confirmation')}
                >
                    Open Confirmation
                </button>
            </div>

            <SubmitAPIConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                previewRequest={previewRequest}
                sending={sending}
                responseData={responseData}
                onSend={async () => {
                    if (!previewRequest?.body) return;
                    setSending(true);
                    let closed = false;
                    const timer = setTimeout(() => {
                        if (!closed) {
                            setIsConfirmOpen(false);
                            closed = true;
                        }
                    }, 5000);
                    try {
                        const resp = await submitAPI(evaluationId, sessionId, previewRequest.body);
                        setResponseData(resp);
                        if (!closed) {
                            setIsConfirmOpen(false);
                            closed = true;
                        }
                    } catch (err) {
                        setResponseData({ error: err?.message || String(err) });
                        if (!closed) {
                            setIsConfirmOpen(false);
                            closed = true;
                        }
                    } finally {
                        clearTimeout(timer);
                        setSending(false);
                    }
                }}
            />

            {/*Request confirmation modal */}
        </div>
    )
}

export default SubmitAPIPanel