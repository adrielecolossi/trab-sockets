const express = require("express");
const app = express();
let pessoasOnline = [];
// ATENCAO
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/meu.html");
});

io.on("connection", (socket) => {
  socket.client.nick = socket.client.id;
  let newUser = {
    id: socket.client.id,
    nick: "",
  };
  pessoasOnline.push(newUser);

  io.emit("chat message", "o usuário " + newUser.id + " se conectou");
  io.emit("online people", pessoasOnline);

  socket.on("chat message", (msg) => {
    io.emit("chat message", socket.client.nick + " disse: " + msg);
  });

  socket.on("set nick", (msg) => {
    const oldNick = socket.client.nick;
    io.emit("chat message", `${oldNick} trocou seu nome para ${msg}`);
    for (let i = 0; i < pessoasOnline.length; i++) {
      if (pessoasOnline[i].id == socket.client.id) {
        pessoasOnline[i].nick = msg;
      }
    }
    socket.client.nick = msg;
    io.emit("online people", pessoasOnline);
  });

  socket.on("disconnect", () => {
    if (newUser.nick !== "") {
      io.emit("chat message", "o usuário " + newUser.nick + " se desconectou");
    } else {
      io.emit("chat message", "o usuário " + newUser.id + " se desconectou");
    }
    let pos;

    for (let i = 0; i < pessoasOnline.length; i++) {
      if (pessoasOnline[i].id == socket.client.id) {
        pos = i;
      }
    }
    pessoasOnline.splice(pos, 1);
    io.emit("online people", pessoasOnline);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3001");
});
