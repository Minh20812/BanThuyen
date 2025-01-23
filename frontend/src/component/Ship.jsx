const Ship = ({ position, size, direction }) => {
  const shipStyle = {
    width: direction === "horizontal" ? `${size * 30}px` : "30px",
    height: direction === "vertical" ? `${size * 30}px` : "30px",
    backgroundColor: "blue",
    position: "absolute",
    top:
      direction === "vertical"
        ? `${position.y * 30}px`
        : `${position.y * 30}px`,
    left:
      direction === "horizontal"
        ? `${position.x * 30}px`
        : `${position.x * 30}px`,
  };

  return <div style={shipStyle}></div>;
};

export default Ship;
