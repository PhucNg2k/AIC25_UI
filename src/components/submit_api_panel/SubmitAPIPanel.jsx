import { useState } from "react";
import SubmitAPIHeader from './SubmitAPIHeader';
import '../../styles/SubmitPanel.css';

function SubmitAPIPanel ({ 
    queryTask, 
    setQueryTask, 
    submitFrameEntry,
    setSubmittedFrames, 
    onClearSubmissions 
}) {
    const [sessionId, setSessionId] = useState("");
    const [evaluationId, setEvaluationId] = useState("");

    const handleSessionIdChange = (newSessionId) => {
        setSessionId(newSessionId);
    };

    const handleEvaluationIdChange = (newEvaluationId) => {
        setEvaluationId(newEvaluationId);
    };

    return (
        <div className="submit-panel">
            <SubmitAPIHeader 
                queryTask={queryTask}
                setQueryTask={setQueryTask}
                onSessionIdChange={handleSessionIdChange}
                onEvaluationIdChange={handleEvaluationIdChange}
            />

            {/* Submitted answer - task dependence */}
            {/* <SubmitAPIInput /> */}

            {/*Display final request */}
            {/* <SubmitAPIBody /> */}

            {/*Submit Button */}
            {/* <SubmitAPIButton /> */}

            {/*Request confirmation modal */}
            {/* <SubmitAPIModal /> */}
        </div>
    )
}

export default SubmitAPIPanel