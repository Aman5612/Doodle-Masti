const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(cors());
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

const cardSchema = new mongoose.Schema({
  title: String,
  imgUrl: String,
});

mongoose.connect(
  "mongodb+srv://aman5612:hUw42fXicveWNNc6@cluster0.cqhprto.mongodb.net/?retryWrites=true&w=majority",
  {
    dbName: "doodle",
  }
);

const Card = mongoose.model("Card", cardSchema);

//Get the Card Data
app.get("/getCards", async (req, res) => {
  try {
    const cards = await Card.find();
    // console.log(cards);
    res.send(cards);
  } catch (err) {
    console.log(err);
    throw err;
  }
});

//Send the Data
app.post("/addCard", async (req, res) => {
  try {
    const title = req.body.title;
    const imgUrl = req.body.imgUrl;
    await Card.create({ title, imgUrl });
    res.send({ msg: "Success!" });
  } catch (err) {
    console.log(err);
    throw err;
  }
});

const handleUpdate = async (action, data) => {
  try {
    // switch(action){
    //   case:"drawing";
    // }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("drawing", (data) => {
    socket.broadcast.emit("drawing", data);
    handleUpdate("drawing", data);
  });
  socket.on("redo", (lastRedoLine, redoLines) => {
    socket.broadcast.emit("redo", lastRedoLine, redoLines);
    handleUpdate("redo", redoLines);
  });
  socket.on("undo", (lastLine, lines) => {
    socket.broadcast.emit("undo", lastLine, lines);
    handleUpdate("undo", lines);
  });
  socket.on("clean", () => {
    socket.broadcast.emit("clean");
    handleUpdate("clean");
  });
  socket.on("image", (img) => {
    socket.broadcast.emit("image", img);
    handleUpdate("image", img);
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
