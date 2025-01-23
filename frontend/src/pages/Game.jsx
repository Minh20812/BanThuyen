import { useRef, useState, useEffect, useCallback } from "react";

const CELL_SIZE = 50;
const GRID_TOP = 50;
const GRID_LEFT = 50;
const GRID_SIZE = 10;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const DOUBLE_CLICK_THRESHOLD = 300;

const initialPieces = [
  { id: 1, x: 500, y: 100, width: 2, isVertical: false, color: "red" },
  { id: 2, x: 500, y: 200, width: 3, isVertical: false, color: "blue" },
  { id: 3, x: 500, y: 300, width: 3, isVertical: false, color: "pink" },
  { id: 4, x: 500, y: 400, width: 4, isVertical: false, color: "orange" },
  { id: 5, x: 500, y: 500, width: 5, isVertical: false, color: "green" },
];

const Game = () => {
  const canvasRef = useRef(null);
  const [pieces, setPieces] = useState(initialPieces);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [occupiedPositions, setOccupiedPositions] = useState([]);
  const [revealedPositions, setRevealedPositions] = useState([]);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewPosition, setPreviewPosition] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const getGridPosition = useCallback((x, y) => {
    const row = Math.floor((y - GRID_TOP) / CELL_SIZE);
    const col = Math.floor((x - GRID_LEFT) / CELL_SIZE);
    return { row, col };
  }, []);

  const isValidPlacement = useCallback((row, col, piece) => {
    if (!piece) return false;

    if (piece.isVertical) {
      return (
        row >= 0 &&
        row + piece.width <= GRID_SIZE &&
        col >= 0 &&
        col < GRID_SIZE
      );
    }
    return (
      row >= 0 && row < GRID_SIZE && col >= 0 && col + piece.width <= GRID_SIZE
    );
  }, []);

  const isPieceOverlapping = useCallback(
    (targetPiece) => {
      const pieceRow = Math.floor((targetPiece.y - GRID_TOP) / CELL_SIZE);
      const pieceCol = Math.floor((targetPiece.x - GRID_LEFT) / CELL_SIZE);

      return pieces.some((otherPiece) => {
        if (targetPiece.id === otherPiece.id) return false;

        const otherRow = Math.floor((otherPiece.y - GRID_TOP) / CELL_SIZE);
        const otherCol = Math.floor((otherPiece.x - GRID_LEFT) / CELL_SIZE);

        if (targetPiece.isVertical) {
          for (let i = 0; i < targetPiece.width; i++) {
            if (otherPiece.isVertical) {
              for (let j = 0; j < otherPiece.width; j++) {
                if (pieceRow + i === otherRow + j && pieceCol === otherCol)
                  return true;
              }
            } else {
              for (let j = 0; j < otherPiece.width; j++) {
                if (pieceRow + i === otherRow && pieceCol === otherCol + j)
                  return true;
              }
            }
          }
        } else {
          for (let i = 0; i < targetPiece.width; i++) {
            if (otherPiece.isVertical) {
              for (let j = 0; j < otherPiece.width; j++) {
                if (pieceRow === otherRow + j && pieceCol + i === otherCol)
                  return true;
              }
            } else {
              for (let j = 0; j < otherPiece.width; j++) {
                if (pieceRow === otherRow && pieceCol + i === otherCol + j)
                  return true;
              }
            }
          }
        }
        return false;
      });
    },
    [pieces]
  );

  const drawGrid = useCallback(
    (ctx) => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          // Draw revealed positions
          const revealedPosition = revealedPositions.find(
            (pos) => pos.row === i && pos.col === j
          );
          if (revealedPosition) {
            ctx.fillStyle = revealedPosition.color;
            ctx.fillRect(
              GRID_LEFT + j * CELL_SIZE,
              GRID_TOP + i * CELL_SIZE,
              CELL_SIZE,
              CELL_SIZE
            );
          }

          // Draw preview
          if (!isGameStarted && previewPosition && currentPiece) {
            if (
              (currentPiece.isVertical &&
                j === previewPosition.col &&
                i >= previewPosition.row &&
                i < previewPosition.row + currentPiece.width) ||
              (!currentPiece.isVertical &&
                i === previewPosition.row &&
                j >= previewPosition.col &&
                j < previewPosition.col + currentPiece.width)
            ) {
              ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
              ctx.fillRect(
                GRID_LEFT + j * CELL_SIZE,
                GRID_TOP + i * CELL_SIZE,
                CELL_SIZE,
                CELL_SIZE
              );
            }
          }

          // Draw grid lines
          ctx.strokeStyle = "gray";
          ctx.strokeRect(
            GRID_LEFT + j * CELL_SIZE,
            GRID_TOP + i * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          );
        }
      }
    },
    [currentPiece, isGameStarted, previewPosition, revealedPositions]
  );

  const drawPieces = useCallback(
    (ctx) => {
      pieces.forEach((piece) => {
        ctx.fillStyle = piece.color;
        ctx.save();

        const pieceWidth = piece.isVertical
          ? CELL_SIZE
          : piece.width * CELL_SIZE;
        const pieceHeight = piece.isVertical
          ? piece.width * CELL_SIZE
          : CELL_SIZE;
        const centerX = piece.x + pieceWidth / 2;
        const centerY = piece.y + pieceHeight / 2;

        if (piece.id === currentPiece?.id) {
          ctx.translate(centerX, centerY);
          ctx.scale(0.9, 0.9);
          ctx.translate(-centerX, -centerY);
        }

        if (piece.isVertical) {
          for (let i = 0; i < piece.width; i++) {
            ctx.fillRect(
              piece.x,
              piece.y + i * CELL_SIZE,
              CELL_SIZE,
              CELL_SIZE
            );
          }
        } else {
          for (let i = 0; i < piece.width; i++) {
            ctx.fillRect(
              piece.x + i * CELL_SIZE,
              piece.y,
              CELL_SIZE,
              CELL_SIZE
            );
          }
        }

        ctx.restore();
      });
    },
    [pieces, currentPiece]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    drawGrid(ctx);
    if (!isGameStarted) {
      drawPieces(ctx);
    }
  }, [drawGrid, drawPieces, isGameStarted]);

  const updatePiecePosition = useCallback((pieceId, newX, newY) => {
    setPieces((prevPieces) =>
      prevPieces.map((piece) =>
        piece.id === pieceId ? { ...piece, x: newX, y: newY } : piece
      )
    );
  }, []);

  const handleDrag = useCallback(
    (x, y) => {
      if (!currentPiece || !isDragging) return;

      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      const { row, col } = getGridPosition(x, y);

      const adjustedCol = currentPiece.isVertical
        ? col
        : Math.max(0, Math.min(col - Math.floor(dragOffset.x / CELL_SIZE), 9));

      if (isValidPlacement(row, adjustedCol, currentPiece)) {
        setPreviewPosition({ row, col: adjustedCol });
        updatePiecePosition(currentPiece.id, newX, newY);
      }
    },
    [
      currentPiece,
      isDragging,
      dragOffset,
      getGridPosition,
      isValidPlacement,
      updatePiecePosition,
    ]
  );

  const handleDrop = useCallback(() => {
    if (!currentPiece) return;

    const { row, col } = getGridPosition(
      currentPiece.x + CELL_SIZE / 2,
      currentPiece.y + CELL_SIZE / 2
    );

    if (isValidPlacement(row, col, currentPiece)) {
      updatePiecePosition(
        currentPiece.id,
        col * CELL_SIZE + GRID_LEFT,
        row * CELL_SIZE + GRID_TOP
      );
    }

    setIsDragging(false);
    setCurrentPiece(null);
    setPreviewPosition(null);
  }, [currentPiece, getGridPosition, isValidPlacement, updatePiecePosition]);

  const handleGridClick = useCallback(
    (x, y) => {
      if (!isGameStarted) return;

      const { row, col } = getGridPosition(x, y);
      const isRevealed = revealedPositions.some(
        (pos) => pos.row === row && pos.col === col
      );

      if (!isRevealed) {
        const occupiedPosition = occupiedPositions.find(
          (pos) => pos.row === row && pos.col === col
        );

        if (occupiedPosition) {
          setRevealedPositions((prev) => [...prev, occupiedPosition]);

          if (revealedPositions.length + 1 === occupiedPositions.length) {
            setTimeout(() => {
              alert("Congratulations! You've found all positions!");
              resetGame();
            }, 100);
          }
        } else {
          alert("Try again!");
        }
      }
    },
    [isGameStarted, occupiedPositions, revealedPositions, getGridPosition]
  );

  const resetGame = useCallback(() => {
    setIsGameStarted(false);
    setOccupiedPositions([]);
    setRevealedPositions([]);
    setPieces(initialPieces);
    setCurrentPiece(null);
    setIsDragging(false);
    setPreviewPosition(null);
  }, []);

  const rotatePiece = useCallback(() => {
    if (!currentPiece) return;

    setPieces((prevPieces) =>
      prevPieces.map((piece) =>
        piece.id === currentPiece.id
          ? { ...piece, isVertical: !piece.isVertical }
          : piece
      )
    );
  }, [currentPiece]);

  const handleMouseDown = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isGameStarted) {
        handleGridClick(mouseX, mouseY);
        return;
      }

      const clickedPiece = pieces.find((piece) => {
        const pieceWidth = piece.isVertical
          ? CELL_SIZE
          : piece.width * CELL_SIZE;
        const pieceHeight = piece.isVertical
          ? piece.width * CELL_SIZE
          : CELL_SIZE;

        return (
          mouseX >= piece.x &&
          mouseX <= piece.x + pieceWidth &&
          mouseY >= piece.y &&
          mouseY <= piece.y + pieceHeight
        );
      });

      if (clickedPiece) {
        const currentTime = Date.now();
        if (currentTime - lastClickTime <= DOUBLE_CLICK_THRESHOLD) {
          rotatePiece();
        } else {
          setCurrentPiece(clickedPiece);
          setIsDragging(true);
          setDragOffset({
            x: mouseX - clickedPiece.x,
            y: mouseY - clickedPiece.y,
          });
        }
        setLastClickTime(currentTime);
      }
    },
    [handleGridClick, isGameStarted, lastClickTime, pieces, rotatePiece]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      handleDrag(mouseX, mouseY);
    },
    [isDragging, handleDrag]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      handleDrop();
    }
  }, [isDragging, handleDrop]);

  const startGame = useCallback(() => {
    const newOccupiedPositions = pieces.flatMap((piece) => {
      const row = Math.floor((piece.y - GRID_TOP) / CELL_SIZE);
      const col = Math.floor((piece.x - GRID_LEFT) / CELL_SIZE);
      const positions = [];

      if (piece.isVertical) {
        for (let i = 0; i < piece.width; i++) {
          positions.push({ row: row + i, col, color: piece.color });
        }
      } else {
        for (let i = 0; i < piece.width; i++) {
          positions.push({ row, col: col + i, color: piece.color });
        }
      }

      return positions;
    });

    setOccupiedPositions(newOccupiedPositions);
    setIsGameStarted(true);
  }, [pieces]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    render();
  }, [render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  const canStartGame = useCallback(() => {
    return pieces.every((piece) => {
      const row = Math.floor((piece.y - GRID_TOP) / CELL_SIZE);
      const col = Math.floor((piece.x - GRID_LEFT) / CELL_SIZE);
      return isValidPlacement(row, col, piece) && !isPieceOverlapping(piece);
    });
  }, [pieces, isValidPlacement, isPieceOverlapping]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-purple-700 to-pink-700 p-2 sm:p-4">
      <div className="min-h-[98vh] bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl p-2 sm:p-4">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {isGameStarted ? "Find the Hidden Pieces!" : "Place Your Pieces"}
          </h1>
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg shadow-lg"
          />
          {!isGameStarted && canStartGame && (
            <button
              onClick={startGame}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Game
            </button>
          )}
          {!isGameStarted && (
            <div className="text-sm text-gray-600">
              <p>Double click to rotate pieces</p>
              <p>Drag pieces to position them</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
