import express from "express";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io"; // Se le crea un alias al server
import http from "http";
import cors from "cors";
import mongodb from "mongodb";

import { PORT } from "./config.js"; // Cuando son módulos locales es necesario especificar la ruta y la extension del archivo

const app = express();
const server = http.createServer(app); // Retorna un nuevo objeto de servidor http al que se le pasa la configuracion de express
const io = new SocketServer(server, {
  cors: {
    origin: "*",
  },
}); // Este nuevo server recibe como parametro un servidor http que se creo anteriormente

const MongoClient = mongodb.MongoClient;
const client = new MongoClient("mongodb://127.0.0.1:27017");

app.use(cors()); // Aqui le decimos que cualquier servidores externo al puerto 3000 se podra conectar
app.use(morgan("dev"));

// Est se ejecutara cuando ocurra el evento connection
// El que escucha el evento utilizara la funcion on

// Este evento se dispara cuando se establece una nueva conexión.
// El primer argumento es una instancia de Socket.
io.on("connection", (socket) => {
  console.log("socket.id", socket.id);

  // Conección y insercion en la base de datos
  client.connect();
  const database = client.db("chat");

  socket.on("message", (message) => {
    console.log("message", socket.id, message);
    // socket.broadcast.emit() reenvia el mensaje a los otros clientes mediante
    // es decir el backend lo recibe y lo reenvia

    socket.broadcast.emit("message", {
      body: message,
      from: socket.id,
    });

    try {
      var msg = {
        from: socket.id,
        body: message,
      };

      database.collection("chats").insertOne(msg);
    } catch (err) {
      console.log("Error connecting to database...");
      process.exit(1);
    }
  });

  socket.on("pconnect", (event) => {
    console.log("pconnect", socket.id, event);
    // socket.broadcast.emit() reenvia el mensaje a los otros clientes mediante
    // es decir el backend lo recibe y lo reenvia

    socket.broadcast.emit("pconnect", {
      user: event,
      from: socket.id,
    });
  });

  /*   console.log(socket.id);
  console.log("A user connected"); */
});

server.listen(PORT);
console.log("Server started on port ", PORT);
