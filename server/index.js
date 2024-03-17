const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("drawing", (data) => {
    socket.broadcast.emit("drawing", data);
  });
  socket.on("redo", (lastRedoLine, redoLines) => {
    socket.broadcast.emit("redo", lastRedoLine, redoLines);
  });
  socket.on("undo", (lastLine, lines) => {
    socket.broadcast.emit("undo", lastLine, lines);
  });
  socket.on("clean", () => {
    socket.broadcast.emit("clean");
  });
  socket.on("image", (img) => {
    socket.broadcast.emit("image", img);
  });
  socket.on("drag", (x, y) => {
    socket.broadcast.emit("drag", x, y);
  });

  socket.on("transform", (width, height, scaleX, scaleY) => {
    socket.broadcast.emit("transform", { width, height, scaleX, scaleY });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
