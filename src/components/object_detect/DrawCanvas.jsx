import { useRef, useEffect, useState } from "react";

export default function DrawCanvas({
  event_num,
  modal,
  selectedClass,
  initialObjMask,
  objMask,
  colorMap = {},
  onUpdateBBox,
}) {
  const canvasRef = useRef(null);
  const [boxes, setBoxes] = useState([]); // {x,y,w,h,class}
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false); // <— key fix
  const [previewRect, setPreviewRect] = useState(null); // {x,y,w,h}
  const startRef = useRef({ x: 0, y: 0 });

  // One-time canvas sizing (optional DPR crispness)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = 640,
      cssH = 360;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // Draw grid + all rectangles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cssW = canvas.clientWidth || canvas.width;
    const cssH = canvas.clientHeight || canvas.height;

    function drawGrid() {
      ctx.save();
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      const cols = 8,
        rows = 8;
      const dx = cssW / cols,
        dy = cssH / rows;
      for (let i = 1; i < cols; i++) {
        const x = Math.round(i * dx) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cssH);
        ctx.stroke();
      }
      for (let j = 1; j < rows; j++) {
        const y = Math.round(j * dy) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cssW, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawAll() {
      drawGrid();
      for (const b of boxes) {
        ctx.save();
        ctx.strokeStyle = colorMap[b.class] || "#007bff";
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.restore();
      }
      if (previewRect) {
        ctx.save();
        const activeClassName = selectedClass && selectedClass.class_name;
        const stroke =
          (activeClassName && colorMap[activeClassName]) || "#007bff";
        ctx.strokeStyle = stroke;
        ctx.fillStyle = stroke + "40"; // alpha tail for hex works in modern browsers
        ctx.lineWidth = 2;
        ctx.fillRect(
          previewRect.x,
          previewRect.y,
          previewRect.w,
          previewRect.h
        );
        ctx.strokeRect(
          previewRect.x,
          previewRect.y,
          previewRect.w,
          previewRect.h
        );
        ctx.restore();
      }
    }

    drawAll();
  }, [boxes, previewRect, colorMap, selectedClass]);

  const handleMouseDown = (e) => {
    if (!selectedClass || !selectedClass.active || !selectedClass.class_name)
      return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startRef.current = { x, y };
    isDrawingRef.current = true; // <— ref first
    setIsDrawing(true);
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp, { once: true });
  };

  const updatePreviewFromEvent = (clientX, clientY) => {
    if (!isDrawingRef.current) return; // <— use ref
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const sx = startRef.current.x;
    const sy = startRef.current.y;
    const left = Math.min(sx, x);
    const top = Math.min(sy, y);
    const w = Math.abs(x - sx);
    const h = Math.abs(y - sy);

    const clampedLeft = Math.max(
      0,
      Math.min(left, canvas.clientWidth || canvas.width)
    );
    const clampedTop = Math.max(
      0,
      Math.min(top, canvas.clientHeight || canvas.height)
    );
    const maxW = Math.max(
      0,
      Math.min(w, (canvas.clientWidth || canvas.width) - clampedLeft)
    );
    const maxH = Math.max(
      0,
      Math.min(h, (canvas.clientHeight || canvas.height) - clampedTop)
    );

    setPreviewRect({ x: clampedLeft, y: clampedTop, w: maxW, h: maxH });
  };

  const handleMouseMove = (e) => updatePreviewFromEvent(e.clientX, e.clientY);
  const handleWindowMouseMove = (e) =>
    updatePreviewFromEvent(e.clientX, e.clientY);

  const finishFromEvent = (clientX, clientY) => {
    if (!isDrawingRef.current) return; // <— use ref
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const sx = startRef.current.x;
    const sy = startRef.current.y;

    const rawLeft = Math.min(sx, x);
    const rawTop = Math.min(sy, y);
    const rawW = Math.abs(x - sx);
    const rawH = Math.abs(y - sy);

    const canvas = canvasRef.current;
    const cw = canvas.clientWidth || canvas.width;
    const ch = canvas.clientHeight || canvas.height;
    const clampedLeft = Math.max(0, Math.min(rawLeft, cw));
    const clampedTop = Math.max(0, Math.min(rawTop, ch));
    const maxRight = Math.max(0, Math.min(Math.max(sx, x), cw));
    const maxBottom = Math.max(0, Math.min(Math.max(sy, y), ch));
    const clampedW = Math.max(0, maxRight - clampedLeft);
    const clampedH = Math.max(0, maxBottom - clampedTop);

    isDrawingRef.current = false; // <— reset ref
    setIsDrawing(false);
    setPreviewRect(null);

    if (clampedW <= 0 || clampedH <= 0) return;

    const canvasBox = {
      x: clampedLeft,
      y: clampedTop,
      w: clampedW,
      h: clampedH,
    };
    const nextCanvasBoxes = [
      ...boxes,
      { ...canvasBox, class: selectedClass.class_name },
    ];
    setBoxes(nextCanvasBoxes);

    if (onUpdateBBox) {
      const classBoxes = nextCanvasBoxes.filter(
        (b) => b.class === selectedClass.class_name
      );
      const normalizedList = classBoxes
        .map((b) =>
          normalizeBox({ x: b.x, y: b.y, w: b.w, h: b.h }, canvasRef.current)
        )
        .filter((b) => b.w > 0 && b.h > 0);
      onUpdateBBox(selectedClass.class_name, normalizedList);
    }
  };

  const handleWindowMouseUp = (e) => {
    finishFromEvent(e.clientX, e.clientY);
    window.removeEventListener("mousemove", handleWindowMouseMove);
  };

  const handleMouseUp = (e) => {
    finishFromEvent(e.clientX, e.clientY);
    window.removeEventListener("mousemove", handleWindowMouseMove);
  };

  function normalizeBox(box, canvas) {
    const canonicalW = 1920,
      canonicalH = 1080;
    const scaleX = canonicalW / (canvas.clientWidth || canvas.width);
    const scaleY = canonicalH / (canvas.clientHeight || canvas.height);
    const x1Raw = box.x * scaleX;
    const y1CanvasTop = box.y + box.h;
    const y1Raw =
      ((canvas.clientHeight || canvas.height) - y1CanvasTop) * scaleY;
    const wRaw = box.w * scaleX;
    const hRaw = box.h * scaleY;

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    let x = clamp(x1Raw, 0, canonicalW);
    let y = clamp(y1Raw, 0, canonicalH);
    let w = Math.max(0, wRaw);
    let h = Math.max(0, hRaw);
    if (x + w > canonicalW) w = clamp(w, 0, canonicalW - x);
    if (y + h > canonicalH) h = clamp(h, 0, canonicalH - y);
    return {
      x: Math.round(x),
      y: Math.round(y),
      w: Math.round(w),
      h: Math.round(h),
    };
  }

  function denormalizeBox(norm, canvas) {
    const canonicalW = 1920,
      canonicalH = 1080;
    const scaleX = canonicalW / (canvas.clientWidth || canvas.width);
    const scaleY = canonicalH / (canvas.clientHeight || canvas.height);
    const x = norm.x / scaleX;
    const w = norm.w / scaleX;
    const h = norm.h / scaleY;
    const yTop = (canvas.clientHeight || canvas.height) - (norm.y / scaleY + h);
    return { x, y: yTop, w, h };
  }

  const hasObjMask = typeof objMask !== "undefined";
  const objMaskKey = JSON.stringify(hasObjMask ? objMask || {} : {});
  const initialMaskKey = JSON.stringify(initialObjMask || {});
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const source = hasObjMask ? objMask || {} : initialObjMask || {};
    if (!source) return;
    const loaded = [];
    Object.entries(source).forEach(([cls, payload]) => {
      const list = Array.isArray(payload?.bbox) ? payload.bbox : [];
      list.forEach((nb) => {
        const d = denormalizeBox(nb, canvas);
        loaded.push({ ...d, class: cls });
      });
    });
    setBoxes(loaded);
  }, [hasObjMask, objMaskKey, initialMaskKey]);

  const handleMouseLeave = () => {
    // keep drawing active; window mousemove/up handle preview and finish
  };

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
              <div
                key={`y_${vy}`}
                className="axis-tick"
                style={{
                  top: `${topPct}%`,
                  left: 0,
                  transform: "translateY(-50%)",
                }}
              >
                {vy}
              </div>
            );
          })}
        </div>
        {/* Canvas */}
        <canvas
          id={`canvas_${event_num}_${modal}`}
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="canvas"
          style={{
            cursor: selectedClass?.active ? "crosshair" : "default",
            pointerEvents: "auto",
          }}
        />
      </div>
      {/* X Axis (bottom) */}
      <div className="axis-x">
        {xTicks.map((vx) => {
          const leftPct = (vx / 1920) * 100;
          return (
            <div
              key={`x_${vx}`}
              className="axis-tick"
              style={{
                left: `${leftPct}%`,
                top: 0,
                transform: "translateX(-50%)",
              }}
            >
              {vx}
            </div>
          );
        })}
      </div>
    </div>
  );
}
