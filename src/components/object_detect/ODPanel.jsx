import { useState, useCallback, useRef, useEffect } from "react"
import './object_detect.css'
import SelectPanel from "./SelectPanel"
import DrawCanvas from "./DrawCanvas"

export default function ODPanel({stage_num, modal, initialObjMask, colorMap = {}, onUpdateInput}) {
    // each ODPanel is for create object mask of each modal in individual state
    
    // ODPanel (main entry), collect bbox inforamtion from DrawCanvas + which class bbox belongs to (SearchPanel)

    // prepare gathered data
    // onUpdateInput with respect to stage_num and modal

    // local state: active class selection from SelectPanel
    const [activeClass, setActiveClass] = useState({ class_name: '', count_condition: '>0', active: false });
    const [choicesState, setChoicesState] = useState([]);

    const handleChangeActiveClass = useCallback((choice) => {
        setActiveClass(choice || { class_name: '', count_condition: '>0', active: false });
    }, []);

    const objMaskRef = useRef(initialObjMask && typeof initialObjMask === 'object' ? { ...initialObjMask } : {});
    const [objMask, setObjMask] = useState(objMaskRef.current);
    const handleRemoveClass = (className) => {
        const nextMask = { ...objMaskRef.current };
        if (nextMask[className]) {
            delete nextMask[className];
            objMaskRef.current = nextMask;
            setObjMask(nextMask);
            onUpdateInput && onUpdateInput(stage_num, modal, { obj_mask: nextMask });
        }
    };

    // Reflect condition changes immediately into obj_mask (for existing classes)
    useEffect(() => {
        if (!choicesState || choicesState.length === 0) return;
        const current = objMaskRef.current || {};
        let changed = false;
        const next = { ...current };
        choicesState.forEach((c) => {
            const name = (c && c.class_name) || '';
            if (!name) return;
            if (next[name]) {
                const newCond = c.count_condition || '>0';
                if (next[name].count_condition !== newCond) {
                    next[name] = { ...next[name], count_condition: newCond };
                    changed = true;
                }
            }
        });
        if (changed) {
            objMaskRef.current = next;
            setObjMask(next);
            onUpdateInput && onUpdateInput(stage_num, modal, { obj_mask: next });
        }
    }, [choicesState, stage_num, modal, onUpdateInput]);


    const handleRegisterBbox = (className, bboxList) => {
        if (!className || !Array.isArray(bboxList)) return;
        const nextMask = { ...objMaskRef.current };
        // find the latest condition from choicesState for this class if present
        const found = (choicesState || []).find(c => c.class_name === className);
        nextMask[className] = {
            count_condition: (found && found.count_condition) || activeClass?.count_condition || '>0',
            bbox: bboxList.map(b => ({ x: b.x, y: b.y, w: b.w, h: b.h }))
        };
        objMaskRef.current = nextMask;
        setObjMask(nextMask);
        if (onUpdateInput) {
            onUpdateInput(stage_num, modal, { obj_mask: nextMask });
        }
    };
    
    return (
        <div className="odpanel">
            <div className="odpanel-card odpanel-left">
                <h4>Classes</h4>
                <SelectPanel
                    onChangeActiveClass={handleChangeActiveClass}
                    initialChoices={Object.entries(objMaskRef.current || {}).map(([cls, payload]) => ({ class_name: cls, count_condition: payload?.count_condition || '>0', active: false }))}
                    onChoicesChange={setChoicesState}
                    onRemoveClass={handleRemoveClass}
                    colorMap={colorMap}
                />
            </div>
            <div className="odpanel-card">
                <h4>Canvas</h4>
                <DrawCanvas
                    stage_num={stage_num}
                    modal={modal}
                    selectedClass={activeClass}
                    initialObjMask={initialObjMask}
                    objMask={objMask}
                    colorMap={colorMap}
                    onUpdateBBox={handleRegisterBbox}
                />
            </div>
        </div>
    )

}