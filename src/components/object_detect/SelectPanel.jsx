import { useState, useEffect } from "react"
import './select_panel.css'
import ClassChoice from "./ClassChoice";

export default function SelectPanel({ onChangeActiveClass, initialChoices, onChoicesChange, onRemoveClass, colorMap = {} }) {
    const [choices, setChoices] = useState([
        { class_name: '', count_condition: '>0', active: false, id: 1 }
    ]);

    useEffect(() => {
        if (Array.isArray(initialChoices) && initialChoices.length > 0) {
            // seed choices; ensure each has an id
            const seeded = initialChoices.map((c, idx) => ({ id: c.id || Date.now() + idx, class_name: c.class_name || '', count_condition: c.count_condition || '>0', active: !!c.active }));
            setChoices(seeded);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const active = choices.find(c => c.active) || { class_name: '', count_condition: '>0', active: false };
        // Only notify when something meaningful changes (avoid endless loops)
        onChangeActiveClass && onChangeActiveClass(active);
        onChoicesChange && onChoicesChange(choices);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [choices]);

    const updateChoice = (idx, patch) => {
        setChoices(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
    };

    const handleChangeClass = (idx, name) => {
        const nextName = (name || '').trim();
        if (!nextName) {
            updateChoice(idx, { class_name: '' });
            return;
        }
        const isDuplicate = choices.some((c, i) => i !== idx && (c.class_name || '').trim().toLowerCase() === nextName.toLowerCase());
        if (isDuplicate) {
            // ignore duplicate selection for another row
            return;
        }
        updateChoice(idx, { class_name: nextName });
    };

    const handleChangeCondition = (idx, cond) => {
        updateChoice(idx, { count_condition: cond });
    };

    const handleTogglePos = (idx) => {
        setChoices(prev => prev.map((c, i) => ({ ...c, active: i === idx ? !c.active : false })));
    };

    const handleAddChoice = () => {
        setChoices(prev => [...prev, { class_name: '', count_condition: '>0', active: false, id: Date.now() }]);
    };

    const handleRemoveChoice = (idx) => {
        setChoices(prev => {
            const target = prev[idx];
            if (target && target.class_name && onRemoveClass) {
                onRemoveClass(target.class_name);
            }
            const next = prev.filter((_, i) => i !== idx);
            return next.length > 0 ? next : [{ class_name: '', count_condition: '>0', active: false, id: Date.now() }];
        });
    };

    return (
        <div className="odsp-select-list" style={{ flex: 1, minHeight: 0 }}>
            {choices.map((c, idx) => (
                <div key={c.id} className="odsp-class-card">
                    <div className="odsp-class-row">
                        <div className="odsp-class-main">
                            <ClassChoice
                                classNameValue={c.class_name}
                                onChangeClass={(name) => handleChangeClass(idx, name)}
                                conditionValue={c.count_condition}
                                onChangeCondition={(cond) => handleChangeCondition(idx, cond)}
                                posActive={!!c.active}
                                onTogglePos={() => handleTogglePos(idx)}
                                disallowedClasses={choices.filter((_, i) => i !== idx).map(o => o.class_name).filter(Boolean)}
                                colorHex={colorMap[c.class_name] || '#f8f9fa'}
                            />
                        </div>
                        <button type="button" className="btn-secondary odsp-remove-btn" onClick={() => handleRemoveChoice(idx)}>Remove</button>
                    </div>
                </div>
            ))}
            <div>
                <button type="button" className="btn-secondary" onClick={handleAddChoice}>Add class</button>
            </div>
        </div>
    )
}