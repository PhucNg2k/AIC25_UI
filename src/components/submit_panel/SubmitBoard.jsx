import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

import '../../styles/SubmitBoard.css'

function DraggableDroppableRow({ frameData, index, isDraggedOver, isBelow, distanceFromTarget }) {
  const { video_name, frame_idx } = frameData;
  const frameName = `${video_name}_${frame_idx}`;
  const dragId = `frame_${index}`;
  const dropId = `drop_${index}`;
  
  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: dragId });

  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
    id: dropId,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    transitionDelay: isBelow ? `${Math.max(0, 0.15 - distanceFromTarget * 0.02)}s` : '0s',
  } : {
    opacity: isDragging ? 0.5 : 1,
    transitionDelay: isBelow ? `${Math.max(0, 0.15 - distanceFromTarget * 0.02)}s` : '0s',
  };

  // Combine refs
  const setNodeRef = (node) => {
    setDragNodeRef(node);
    setDropNodeRef(node);
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`draggable-row droppable-row ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-over' : ''} ${isBelow ? 'pushed-down' : ''}`}
      data-index={index}
    >
      <td className="frame-name">
        <span className="drag-handle">⋮⋮</span>
        <span className="frame-text">{frameName}</span>
      </td>
    </tr>
  );
}

function SubmitBoard({ submitType, submittedFrames, setSubmittedFrames }) {
    const [draggedOverIndex, setDraggedOverIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (event) => {
        setIsDragging(true);
    };

    const handleDragOver = (event) => {
        const { over, active } = event;
        
        if (over && active) {
            const overIndex = parseInt(over.id.replace('drop_', ''));
            const activeIndex = parseInt(active.id.replace('frame_', ''));
            
            // Simple: show drop indicator when hovering over different row
            if (activeIndex !== overIndex) {
                setDraggedOverIndex(overIndex);
            } else {
                setDraggedOverIndex(null);
            }
        } else {
            setDraggedOverIndex(null);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        
        setIsDragging(false);
        setDraggedOverIndex(null);

        if (over && active.id !== over.id) {
            const activeIndex = parseInt(active.id.replace('frame_', ''));
            const overIndex = parseInt(over.id.replace('drop_', ''));

            // Simple reorder: move item to new position
            const newFrames = [...submittedFrames];
            const [draggedItem] = newFrames.splice(activeIndex, 1);
            newFrames.splice(overIndex, 0, draggedItem);
            
            setSubmittedFrames(newFrames);
        }
    };

    return (
        <div className="submit-board">
            {submittedFrames.length === 0 ? (
                <div className="empty-state">
                    <p>No frames submitted yet</p>
                    <p className="hint">Enter a query above and submit frames from any video to build your collection</p>
                </div>
            ) : (
                <DndContext
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <table className="frames-table">
                        <thead>
                            <tr>
                                <th>Frame Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submittedFrames.map((frameData, index) => {
                                const isBelow = draggedOverIndex !== null && index > draggedOverIndex;
                                // Calculate distance from drop target for cascading animation
                                const distanceFromTarget = isBelow ? index - draggedOverIndex : 0;
                                return (
                                    <DraggableDroppableRow
                                        key={`frame_${index}`}
                                        frameData={frameData}
                                        index={index}
                                        isDraggedOver={draggedOverIndex === index}
                                        isBelow={isBelow}
                                        distanceFromTarget={distanceFromTarget}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </DndContext>
            )}
        </div>
    )
}

export default SubmitBoard
