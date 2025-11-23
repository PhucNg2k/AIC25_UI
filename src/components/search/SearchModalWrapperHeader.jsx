import { useMemo } from "react";

function SearchModalWrapperHeader({
  event_num,
  onToggle,
  isCollapsed, // collapse this particular event search
  onRemove,
  disableRemove,
}) {
  const backgroundColor = useMemo(() => {
    const palette = [
      "#E3F2FD",
      "#E8F5E9",
      "#FFF3E0",
      "#F3E5F5",
      "#E0F7FA",
      "#FCE4EC",
      "#FFFDE7",
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor,
        padding: 8,
        borderRadius: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={(e) => {
            e.stopPropagation();
            onToggle && onToggle();
          }}
          style={{ padding: "4px 8px", fontSize: 12 }}
        >
          {isCollapsed ? "Expand" : "Collapse"}
        </button>

        <h3 style={{ padding: "4px" }}>Event {event_num}</h3>
      </div>
      {onRemove ? (
        <button
          type="button"
          className="btn-secondary"
          onClick={(e) => {
            e.stopPropagation();
            onRemove && onRemove();
          }}
          disabled={disableRemove}
          style={{ padding: "4px 8px", fontSize: 12 }}
        >
          Remove Event
        </button>
      ) : null}
    </div>
  );
}

export default SearchModalWrapperHeader;
