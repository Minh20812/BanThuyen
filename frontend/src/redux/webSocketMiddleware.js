import { setOnlineStatus } from "./feature/playerSlice";

// Biến toàn cục để lưu trữ kết nối WebSocket
let socket = null;

const webSocketMiddleware = (store) => (next) => (action) => {
  const { type, payload } = action;

  switch (type) {
    case "user/connectWebSocket":
      // Nếu chưa có socket hoặc socket đã đóng, khởi tạo lại
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        socket = new WebSocket(payload); // payload là URL WebSocket
        console.log("WebSocket connecting to:", payload);

        // Sự kiện khi WebSocket được kết nối
        socket.onopen = () => {
          console.log("WebSocket connected");
          store.dispatch({ type: "user/setOnlineStatus", payload: true }); // Cập nhật trạng thái
        };

        // Xử lý tin nhắn nhận được
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);

          // Xử lý các sự kiện từ server
          switch (message.type) {
            case "onlineStatus":
              store.dispatch(setOnlineStatus(message.data));
              break;

            default:
              console.log("Unknown WebSocket message type:", message.type);
          }
        };

        // Khi WebSocket đóng kết nối
        socket.onclose = (event) => {
          console.log("WebSocket disconnected", event.reason);
          store.dispatch({ type: "user/setOnlineStatus", payload: false }); // Cập nhật trạng thái
        };

        // Khi xảy ra lỗi trong WebSocket
        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      }
      break;

    case "user/disconnectWebSocket":
      if (socket) {
        console.log("WebSocket disconnecting...");
        socket.close();
        socket = null;
      }
      break;

    case "chat/sendMessage":
      // Gửi tin nhắn qua WebSocket
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({ type: "sendMessage", data: payload }) // payload chứa nội dung tin nhắn
        );
      } else {
        console.warn("WebSocket is not connected. Cannot send message.");
      }
      break;

    case "chat/startTyping":
      // Gửi sự kiện đang gõ (typing)
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({ type: "typingStatus", data: payload }) // payload chứa thông tin typing
        );
      }
      break;

    default:
      break;
  }

  return next(action);
};

export default webSocketMiddleware;
