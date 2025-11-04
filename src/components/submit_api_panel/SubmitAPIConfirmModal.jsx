function SubmitAPIConfirmModal({
  isOpen,
  onClose,
  previewRequest,
  sending = false,
  responseData = null,
  onSend,
}) {
  if (!isOpen) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && !sending) onClose();
  };

  return (
    <div className="frame-slider-modal-overlay" onClick={handleBackdrop}>
      <div className="frame-slider-modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Submission</h3>
          <button className="close-btn" onClick={() => !sending && onClose()}>×</button>
        </div>
        <div className="modal-content">
          <div className="request-preview" style={{ width: '100%' }}>
            <strong>Final Request</strong>
            <div>
              <div><b>URL</b>: <span style={{ wordBreak: 'break-all' }}>{previewRequest?.url}</span></div>
              <div><b>Method</b>: {previewRequest?.method}</div>
              <div><b>Params</b>:</div>
              <pre>{JSON.stringify(previewRequest?.params || {}, null, 2)}</pre>
              <div><b>Body</b>:</div>
              <pre>{previewRequest?.body ? JSON.stringify(previewRequest.body, null, 2) : '// No body'}</pre>
            </div>
          </div>

          {responseData && (() => {
            const status = Number(responseData.status) || 0;
            const submission = responseData?.data?.submission || responseData?.submission;
            const wrongByPayload = status === 200 && String(submission).toUpperCase() === 'WRONG';
            const statusForcingRed = status === 412;
            const ok = typeof responseData.ok === 'boolean' ? responseData.ok : (status >= 200 && status < 300);
            const isSuccess = !(wrongByPayload || statusForcingRed) && ok;
            const bg = isSuccess ? '#ccffe0' : '#ffd6d6';
            const br = isSuccess ? '#1e7e34' : '#c82333';
            const fg = isSuccess ? '#0f5132' : '#842029';
            return (
              <div
                className="request-preview"
                style={{ width: '100%', background: bg, borderColor: br, color: fg, fontWeight: 600 }}
              >
              <strong>Response</strong>
              <div><b>Status</b>: {`${responseData.status || ''} ${responseData.statusText || ''}`.trim()}</div>
              {typeof responseData.ok !== 'undefined' && (
                <div><b>Success</b>: {String(responseData.ok)}</div>
              )}
              {typeof submission !== 'undefined' && (
                <div><b>Submission</b>: {String(submission)}</div>
              )}
              {responseData.description && (
                <div><b>Description</b>: {responseData.description}</div>
              )}
              <div><b>Body</b>:</div>
              <pre>{JSON.stringify(responseData.data ?? responseData, null, 2)}</pre>
              </div>
            );
          })()}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '10px 16px' }}>
          <button
            type="button"
            className="clear-btn"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="export-btn"
            onClick={onSend}
            disabled={sending || !previewRequest?.body}
            title={!previewRequest?.body ? 'No body to send' : 'Send request'}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubmitAPIConfirmModal;


