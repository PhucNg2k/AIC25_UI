import { useRef, useEffect, useState } from "react";

export default function DrawCanvas({ stage_num, modal, selectedClass, initialObjMask, objMask, colorMap = {}, onUpdateBBox }) {
    const canvasRef = useRef(null);
    const [boxes, setBoxes] = useState([]); // {x,y,w,h,class}
    const [isDrawing, setIsDrawing] = useState(false);
    const [previewRect, setPreviewRect] = useState(null); // {x,y,w,h}
    const startRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // basic canvas size; can be styled responsive; calculations use local size
        canvas.width = 640;
        canvas.height = 360;

        function drawGrid() {
            // draw a subtle 8x8 grid
            ctx.save();
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
            ctx.lineWidth = 0.5;
            const cols = 8;
            const rows = 8;
            const dx = canvas.width / cols;
            const dy = canvas.height / rows;
            // vertical lines
            for (let i = 1; i < cols; i++) {
                const x = Math.round(i * dx) + 0.5;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            // horizontal lines
            for (let j = 1; j < rows; j++) {
                const y = Math.round(j * dy) + 0.5;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            ctx.restore();
        }

        function drawAll() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // grid background
            drawGrid();

            // draw existing boxes
            for (const b of boxes) {
                ctx.save();
                // color by class from props
                ctx.strokeStyle = colorMap[b.class] || "#007bff";
                ctx.lineWidth = 2;
                ctx.strokeRect(b.x, b.y, b.w, b.h);
                ctx.restore();
            }

            // draw preview on top (use current class color)
            if (previewRect) {
                ctx.save();
                const activeClassName = selectedClass && selectedClass.class_name;
                const stroke = (activeClassName && colorMap[activeClassName]) || "#007bff";
                // create a semi-transparent fill from the stroke color (fallback to blue)
                ctx.strokeStyle = stroke;
                ctx.fillStyle = stroke + '40'; // add transparency if hex supports; fallback ok
                ctx.lineWidth = 2;
                ctx.fillRect(previewRect.x, previewRect.y, previewRect.w, previewRect.h);
                ctx.strokeRect(previewRect.x, previewRect.y, previewRect.w, previewRect.h);
                ctx.restore();
            }
        }

        drawAll();
    }, [boxes, previewRect]);

    const handleMouseDown = (e) => {
        if (!selectedClass || !selectedClass.active || !selectedClass.class_name) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        startRef.current = { x, y };
        setIsDrawing(true);
        // attach global listeners to support dragging outside canvas
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp, { once: true });
    };

    const updatePreviewFromEvent = (clientX, clientY) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const sx = startRef.current.x;
        const sy = startRef.current.y;

        // normalize so width/height are always positive
        const left = Math.min(sx, x);
        const top = Math.min(sy, y);
        const w = Math.abs(x - sx);
        const h = Math.abs(y - sy);

        // clamp for preview drawing within canvas bounds so it doesn't disappear
        const clampedLeft = Math.max(0, Math.min(left, canvas.width));
        const clampedTop = Math.max(0, Math.min(top, canvas.height));
        const maxW = Math.max(0, Math.min(w, canvas.width - clampedLeft));
        const maxH = Math.max(0, Math.min(h, canvas.height - clampedTop));

        setPreviewRect({ x: clampedLeft, y: clampedTop, w: maxW, h: maxH });
    };

    const handleMouseMove = (e) => {
        updatePreviewFromEvent(e.clientX, e.clientY);
    };

    const handleWindowMouseMove = (e) => {
        updatePreviewFromEvent(e.clientX, e.clientY);
    };
    
    const handleWindowMouseUp = (e) => {
        finishFromEvent(e.clientX, e.clientY);
        window.removeEventListener('mousemove', handleWindowMouseMove);
    };

    const finishFromEvent = (clientX, clientY) => {
        if (!isDrawing) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const sx = startRef.current.x;
        const sy = startRef.current.y;

        // normalize so box is consistent (raw)
        const rawLeft = Math.min(sx, x);
        const rawTop = Math.min(sy, y);
        const rawW = Math.abs(x - sx);
        const rawH = Math.abs(y - sy);

        // clamp final box to canvas bounds so mouseup outside still yields edge-clamped box
        const canvas = canvasRef.current;
        const clampedLeft = Math.max(0, Math.min(rawLeft, canvas.width));
        const clampedTop = Math.max(0, Math.min(rawTop, canvas.height));
        const maxRight = Math.max(0, Math.min(Math.max(sx, x), canvas.width));
        const maxBottom = Math.max(0, Math.min(Math.max(sy, y), canvas.height));
        const clampedW = Math.max(0, maxRight - clampedLeft);
        const clampedH = Math.max(0, maxBottom - clampedTop);

        setIsDrawing(false);
        setPreviewRect(null);

        // ignore zero-area boxes
        if (clampedW <= 0 || clampedH <= 0) {
            return;
        }
        const canvasBox = { x: clampedLeft, y: clampedTop, w: clampedW, h: clampedH };
        const nextCanvasBoxes = [...boxes, { ...canvasBox, class: selectedClass.class_name }];
        setBoxes(nextCanvasBoxes);

        if (onUpdateBBox) {
            const classBoxes = nextCanvasBoxes.filter(b => b.class === selectedClass.class_name);
            const normalizedList = classBoxes
                .map(b => normalizeBox({ x: b.x, y: b.y, w: b.w, h: b.h }, canvasRef.current))
                .filter(b => b.w > 0 && b.h > 0);
            onUpdateBBox(selectedClass.class_name, normalizedList);
        }
    };

    const handleMouseUp = (e) => {
        finishFromEvent(e.clientX, e.clientY);
        window.removeEventListener('mousemove', handleWindowMouseMove);
        // mouseup listener is once-true; no need to remove
    };

    function normalizeBox(box, canvas) {
        // Convert to canonical resolution (1920x1080) and origin at bottom-left
        const canonicalW = 1920;
        const canonicalH = 1080;
        const scaleX = canonicalW / canvas.width;
        const scaleY = canonicalH / canvas.height;
        const x1Raw = box.x * scaleX;
        const y1CanvasTop = box.y + box.h; // bottom of box in canvas coordinates
        const y1Raw = (canvas.height - y1CanvasTop) * scaleY; // flip origin to bottom-left
        const wRaw = box.w * scaleX;
        const hRaw = box.h * scaleY;

        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

        // Clamp x,y
        let x = clamp(x1Raw, 0, canonicalW);
        let y = clamp(y1Raw, 0, canonicalH);
        // Clamp width/height to stay within bounds and be non-negative
        let w = Math.max(0, wRaw);
        let h = Math.max(0, hRaw);
        if (x + w > canonicalW) w = clamp(w, 0, canonicalW - x);
        if (y + h > canonicalH) h = clamp(h, 0, canonicalH - y);

        return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
    }

    function denormalizeBox(norm, canvas) {
        const canonicalW = 1920;
        const canonicalH = 1080;
        const scaleX = canonicalW / canvas.width;
        const scaleY = canonicalH / canvas.height;
        const x = norm.x / scaleX;
        const w = norm.w / scaleX;
        const h = norm.h / scaleY;
        const yTop = canvas.height - ((norm.y / scaleY) + h);
        return { x, y: yTop, w, h };
    }

    // Preload and refresh boxes from current objMask
    const hasObjMask = typeof objMask !== 'undefined';
    const objMaskKey = JSON.stringify(hasObjMask ? (objMask || {}) : {});
    const initialMaskKey = JSON.stringify(initialObjMask || {});
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const source = hasObjMask ? (objMask || {}) : (initialObjMask || {});
        if (!source) return;
        const loaded = [];
        Object.entries(source).forEach(([cls, payload]) => {
            const list = Array.isArray(payload?.bbox) ? payload.bbox : [];
            list.forEach(nb => {
                const d = denormalizeBox(nb, canvas);
                loaded.push({ ...d, class: cls });
            });
        });
        setBoxes(loaded);
    }, [hasObjMask, objMaskKey, initialMaskKey]);

    const handleMouseLeave = () => {
        // keep drawing active; global mousemove/up handle preview and finish
    };

    // 8x8 grid ticks (9 tick marks including 0 and max)
    const xTicks = Array.from({ length: 9 }, (_, i) => i * 240);
    const yTicks = Array.from({ length: 9 }, (_, i) => i * 135);
    return (
        <div style={{ display: "inline-block" }}>
            <div style={{ display: "flex", alignItems: "stretch" }}>
                {/* Y Axis (left) */}
                <div className="axis-y">
                    {yTicks.map((vy) => {
                        const topPct = 100 - (vy / 1080) * 100;
                        return (
                            <div key={`y_${vy}`} className="axis-tick" style={{ top: `${topPct}%`, left: 0, transform: "translateY(-50%)" }}>
                                {vy}
                            </div>
                        );
                    })}
                </div>
                {/* Canvas */}
                <canvas
                    id={`canvas_${stage_num}_${modal}`}
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    className="canvas"
                    style={{ cursor: selectedClass?.active ? "crosshair" : "default" }}
                ></canvas>
            </div>
            {/* X Axis (bottom) */}
            <div className="axis-x">
                {xTicks.map((vx) => {
                    const leftPct = (vx / 1920) * 100;
                    return (
                        <div key={`x_${vx}`} className="axis-tick" style={{ left: `${leftPct}%`, top: 0, transform: "translateX(-50%)" }}>
                            {vx}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
