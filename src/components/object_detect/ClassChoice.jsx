export default function ClassChoice({
    classNameValue = '',
    onChangeClass,
    conditionValue = '>0',
    onChangeCondition,
    posActive = false,
    onTogglePos,
    disallowedClasses = [],
    colorHex = '#f8f9fa'
}) {
    const isDisallowed = (name) => {
        if (!name) return false;
        return disallowedClasses.map(c => (c || '').toLowerCase()).includes(name.toLowerCase());
    };
    return (
        <>
            <div className="class-color" style={{ background: colorHex }}>
                <input
                    list="class-values"
                    id="class-name"
                    value={classNameValue}
                    onChange={(e) => onChangeClass && onChangeClass(e.target.value)}
                    placeholder="Choose class..."
                    className="class-input"
                />
                <datalist id="class-values">
                    {['Person', 'Cat', 'Dog'].map((opt) => (
                        isDisallowed(opt) && opt !== classNameValue ? null : <option key={opt} value={opt} />
                    ))}
                </datalist>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label htmlFor="num">Condition:</label>
                <input
                    type="text"
                    id="num"
                    value={conditionValue}
                    onChange={(e) => onChangeCondition && onChangeCondition(e.target.value)}
                    style={{ padding: '6px 8px', width: 100 }}
                />
                <button
                    type="button"
                    onClick={() => onTogglePos && onTogglePos()}
                    className={`pos-btn ${posActive ? 'active' : ''}`}
                    title="Activate class for drawing"
                >
                    POS
                </button>
            </div>
        </>
    )
}