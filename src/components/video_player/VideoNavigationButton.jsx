function VideoNavigationButton({ 
  direction, 
  onClick, 
  disabled, 
  className 
}) {
  const isNext = direction === 'next'
  const icon = isNext ? '➡️' : '⬅️'
  const defaultClassName = isNext ? 'navigate_next_btn' : 'navigate_prev_btn'
  
  return (
    <button 
      className={className || defaultClassName}
      onClick={onClick}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {icon}
    </button>
  )
}

export default VideoNavigationButton
