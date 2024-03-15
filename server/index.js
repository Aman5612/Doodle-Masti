const bodyParser = require("body-parser");
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const port = 3000;
const server = createServer(app);
const io = new Server(server);

app.use(express());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
