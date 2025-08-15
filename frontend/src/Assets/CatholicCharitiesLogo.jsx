const CatholicCharitiesLogo = ({ color = "#FFFFFF", width = 120, height = 80 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M78.5 12C78.5 18.5 73.5 24 67 24C60.5 24 55.5 18.5 55.5 12C55.5 5.5 60.5 0 67 0C73.5 0 78.5 5.5 78.5 12Z"
        fill={color}
      />
      <path d="M67 24V80" stroke={color} strokeWidth="4" />
      <path d="M55.5 36H78.5" stroke={color} strokeWidth="4" />
    </svg>
  )
}

export default CatholicCharitiesLogo