const grid = Array(10)
  .fill(null)
  .map(() => Array(10).fill(0));

const cellSize = 50;
const gridTop = 50;
const gridLeft = 50;
const DOUBLE_CLICK_THRESHOLD = 300; // Threshold for distinguishing double-click
let currentPiece = null; // Track the currently selected piece
let previewPosition = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let lastClickTime = 0;
let isGameStarted = false;
let occupiedPositions = [];
let revealedPositions = [];

const pieces = [
  { x: 500, y: 100, width: 2, isVertical: false, color: "red" },
  { x: 500, y: 200, width: 3, isVertical: false, color: "blue" },
  { x: 500, y: 300, width: 3, isVertical: false, color: "pink" },
  { x: 500, y: 400, width: 4, isVertical: false, color: "orange" },
  { x: 500, y: 500, width: 5, isVertical: false, color: "green" },
];

const startButton = document.getElementById("startButton");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

function saveOccupiedPositions() {
  occupiedPositions = [];
  pieces.forEach((piece) => {
    const row = Math.floor((piece.y - gridTop) / cellSize);
    const col = Math.floor((piece.x - gridLeft) / cellSize);

    if (row >= 0 && col >= 0) {
      if (piece.isVertical) {
        for (let i = 0; i < piece.width; i++) {
          occupiedPositions.push({
            row: row + i,
            col: col,
            color: piece.color,
          });
        }
      } else {
        for (let i = 0; i < piece.width; i++) {
          occupiedPositions.push({
            row: row,
            col: col + i,
            color: piece.color,
          });
        }
      }
    }
  });
  console.log("Saved positions:", occupiedPositions);
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      // Vẽ các ô đã được tiết lộ
      const revealedPosition = revealedPositions.find(
        (pos) => pos.row === i && pos.col === j
      );
      if (revealedPosition) {
        ctx.fillStyle = revealedPosition.color;
        ctx.fillRect(
          gridLeft + j * cellSize,
          gridTop + i * cellSize,
          cellSize,
          cellSize
        );
      }

      // Vẽ preview khi game chưa bắt đầu
      if (
        !isGameStarted &&
        previewPosition &&
        ((currentPiece?.isVertical &&
          j === previewPosition.col &&
          i >= previewPosition.row &&
          i < previewPosition.row + currentPiece.width) ||
          (!currentPiece?.isVertical &&
            i === previewPosition.row &&
            j >= previewPosition.col &&
            j < previewPosition.col + currentPiece.width))
      ) {
        ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
        ctx.fillRect(
          gridLeft + j * cellSize,
          gridTop + i * cellSize,
          cellSize,
          cellSize
        );
      }

      // Vẽ viền grid
      ctx.strokeStyle = "gray";
      ctx.strokeRect(
        gridLeft + j * cellSize,
        gridTop + i * cellSize,
        cellSize,
        cellSize
      );
    }
  }
}

function drawPieces() {
  pieces.forEach((piece) => {
    ctx.fillStyle = piece.color;

    // Lưu trạng thái canvas hiện tại
    ctx.save();

    // Tính toán tâm của piece để scale từ điểm giữa
    const pieceWidth = piece.isVertical ? cellSize : piece.width * cellSize;
    const pieceHeight = piece.isVertical ? piece.width * cellSize : cellSize;
    const centerX = piece.x + pieceWidth / 2;
    const centerY = piece.y + pieceHeight / 2;

    // Áp dụng scale nếu là piece được chọn
    if (piece === currentPiece) {
      ctx.translate(centerX, centerY);
      ctx.scale(0.9, 0.9); // Scale nhỏ đi 90%
      ctx.translate(-centerX, -centerY);
    }

    // Vẽ piece
    if (piece.isVertical) {
      for (let i = 0; i < piece.width; i++) {
        ctx.fillRect(piece.x, piece.y + i * cellSize, cellSize, cellSize);
      }
    } else {
      for (let i = 0; i < piece.width; i++) {
        ctx.fillRect(piece.x + i * cellSize, piece.y, cellSize, cellSize);
      }
    }

    // Khôi phục trạng thái canvas
    ctx.restore();
  });
}

function isPieceOnGrid(piece) {
  const row = Math.floor((piece.y - gridTop) / cellSize);
  const col = Math.floor((piece.x - gridLeft) / cellSize);

  // Kiểm tra piece có nằm hoàn toàn trong grid không
  if (piece.isVertical) {
    return row >= 0 && row + piece.width <= 10 && col >= 0 && col < 10;
  } else {
    return row >= 0 && row < 10 && col >= 0 && col + piece.width <= 10;
  }
}

// Thêm hàm kiểm tra xem piece có chồng lên piece khác không
function isPieceOverlapping(piece) {
  const pieceRow = Math.floor((piece.y - gridTop) / cellSize);
  const pieceCol = Math.floor((piece.x - gridLeft) / cellSize);

  for (let otherPiece of pieces) {
    if (piece === otherPiece) continue;

    const otherRow = Math.floor((otherPiece.y - gridTop) / cellSize);
    const otherCol = Math.floor((otherPiece.x - gridLeft) / cellSize);

    // Kiểm tra va chạm
    if (piece.isVertical) {
      for (let i = 0; i < piece.width; i++) {
        if (otherPiece.isVertical) {
          for (let j = 0; j < otherPiece.width; j++) {
            if (pieceRow + i === otherRow + j && pieceCol === otherCol) {
              return true;
            }
          }
        } else {
          for (let j = 0; j < otherPiece.width; j++) {
            if (pieceRow + i === otherRow && pieceCol === otherCol + j) {
              return true;
            }
          }
        }
      }
    } else {
      for (let i = 0; i < piece.width; i++) {
        if (otherPiece.isVertical) {
          for (let j = 0; j < otherPiece.width; j++) {
            if (pieceRow === otherRow + j && pieceCol + i === otherCol) {
              return true;
            }
          }
        } else {
          for (let j = 0; j < otherPiece.width; j++) {
            if (pieceRow === otherRow && pieceCol + i === otherCol + j) {
              return true;
            }
          }
        }
      }
    }
  }
  return false;
}

// Thêm hàm kiểm tra tất cả các pieces
function checkAllPieces() {
  for (const piece of pieces) {
    // Kiểm tra xem piece có nằm trên grid không
    if (!isPieceOnGrid(piece)) {
      return false;
    }

    // Kiểm tra xem piece có chồng lên piece khác không
    if (isPieceOverlapping(piece)) {
      return false;
    }
  }
  return true;
}

function render() {
  drawGrid();
  if (!isGameStarted) {
    drawPieces();
    if (checkAllPieces()) {
      startButton.style.display = "block";
    } else {
      startButton.style.display = "none";
    }
  }
}

function handleGridClick(mouseX, mouseY) {
  const { row, col } = getGridPosition(mouseX, mouseY);

  // Kiểm tra xem ô đã được tiết lộ chưa
  const isRevealed = revealedPositions.some(
    (pos) => pos.row === row && pos.col === col
  );

  if (!isRevealed) {
    // Kiểm tra xem ô có bị chiếm không
    const occupiedPosition = occupiedPositions.find(
      (pos) => pos.row === row && pos.col === col
    );

    if (occupiedPosition) {
      // Nếu đúng, thêm vào danh sách các ô đã tiết lộ
      revealedPositions.push(occupiedPosition);
      render();

      // Kiểm tra chiến thắng
      if (revealedPositions.length === occupiedPositions.length) {
        setTimeout(() => {
          alert("Congratulations! You've found all positions!");
          resetGame();
        }, 100);
      }
    } else {
      // Nếu sai, thông báo cho người chơi
      alert("Try again!");
    }
  }
}

function resetGame() {
  isGameStarted = false;
  occupiedPositions = [];
  revealedPositions = [];
  pieces.forEach((piece) => {
    piece.x = 500; // Reset về vị trí ban đầu
    piece.isVertical = false;
  });
  startButton.style.display = "none";
  render();
}

function getGridPosition(x, y) {
  const row = Math.floor((y - gridTop) / cellSize);
  const col = Math.floor((x - gridLeft) / cellSize);
  return { row, col };
}

function onDrag(x, y) {
  currentPiece.x = x - dragOffsetX;
  currentPiece.y = y - dragOffsetY;

  // Tính toán vị trí lưới dựa trên điểm click
  const clickPosition = getGridPosition(x, y);

  // Điều chỉnh cột để luôn bắt đầu từ đầu của thanh
  const adjustedCol = currentPiece.isVertical
    ? clickPosition.col
    : Math.max(
        0,
        Math.min(clickPosition.col - Math.floor(dragOffsetX / cellSize), 9)
      );

  const adjustedRow = clickPosition.row;

  if (isValidPlacement(adjustedRow, adjustedCol)) {
    previewPosition = {
      row: adjustedRow,
      col: adjustedCol,
    };
  } else {
    previewPosition = null;
  }
}

function onDrop() {
  const { row, col } = getGridPosition(
    currentPiece.x + cellSize / 2,
    currentPiece.y + cellSize / 2
  );

  if (isValidPlacement(row, col)) {
    placePiece(row, col);
  }
  previewPosition = null;
}

function isValidPlacement(row, col) {
  if (!currentPiece) return false;

  if (currentPiece.isVertical) {
    return row >= 0 && row + currentPiece.width <= 10 && col >= 0 && col < 10;
  } else {
    return row >= 0 && row < 10 && col >= 0 && col + currentPiece.width <= 10;
  }
}

function placePiece(row, col) {
  currentPiece.x = col * cellSize + gridLeft;
  currentPiece.y = row * cellSize + gridTop;
}

function rotatePiece() {
  currentPiece.isVertical = !currentPiece.isVertical;

  const { row, col } = getGridPosition(
    currentPiece.x + cellSize / 2,
    currentPiece.y + cellSize / 2
  );
  if (!isValidPlacement(row, col)) {
    currentPiece.isVertical = !currentPiece.isVertical;
  }

  render();
}

function isClickOnPiece(mouseX, mouseY) {
  return pieces.find((piece) => {
    const pieceWidth = piece.isVertical ? cellSize : piece.width * cellSize;
    const pieceHeight = piece.isVertical ? piece.width * cellSize : cellSize;

    const isInside =
      mouseX >= piece.x &&
      mouseX <= piece.x + pieceWidth &&
      mouseY >= piece.y &&
      mouseY <= piece.y + pieceHeight;

    if (isInside) {
      currentPiece = piece;
      // Tính toán offset relative với điểm click trong piece
      if (!piece.isVertical) {
        const clickOffsetInPiece = mouseX - piece.x;
        dragOffsetX = clickOffsetInPiece;
      } else {
        dragOffsetX = mouseX - piece.x;
      }
      dragOffsetY = mouseY - piece.y;
      return true;
    }
    return false;
  });
}

canvas.addEventListener("mousedown", (e) => {
  const mouseX = e.clientX - canvas.offsetLeft;
  const mouseY = e.clientY - canvas.offsetTop;

  if (isGameStarted) {
    handleGridClick(mouseX, mouseY);
  } else {
    if (isClickOnPiece(mouseX, mouseY)) {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastClickTime;

      if (timeDiff > DOUBLE_CLICK_THRESHOLD) {
        isDragging = true;
        dragOffsetX = mouseX - currentPiece.x;
        dragOffsetY = mouseY - currentPiece.y;
      }

      lastClickTime = currentTime;
      render();
    } else {
      currentPiece = null;
      render();
    }
  }
});

canvas.addEventListener("dblclick", (e) => {
  if (!isGameStarted && currentPiece && !isDragging) {
    rotatePiece();
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!isGameStarted && isDragging) {
    const mouseX = e.clientX - canvas.offsetLeft;
    const mouseY = e.clientY - canvas.offsetTop;
    onDrag(mouseX, mouseY);
    render();
  }
});

canvas.addEventListener("mouseup", () => {
  if (!isGameStarted && isDragging) {
    isDragging = false;
    onDrop();
    currentPiece = null;
    render();
  }
});

startButton.addEventListener("click", () => {
  isGameStarted = true;
  saveOccupiedPositions();
  startButton.style.display = "none";
  render();
});

render();
