import "./App.css";
import io from "socket.io-client";
import { useState, useEffect } from "react"; // el hook userEffect nos permite ejecutar codigo cuando carga la aplicacion

const socketLocal = io("localhost:4000"); // Crear un socket cliente hacia el servidor
const socketB = io("192.168.1.70:4000"); // Crear un socket cliente hacia el servidor

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // El socket que emite el evento siempre utilizara, socket.emit
    // Aqui se envia al backend la informacion
    socketLocal.emit("message", message);
    socketB.emit("message", message);

    const newMessage = {
      body: message,
      from: "Me",
    };

    console.log(newMessage);
    setMessages([newMessage, ...messages]);
    setMessage("");
  };

  // Emite el evento message
  useEffect(() => {
    const receiveMessage = (message) => {
      console.log(message);
      setMessages([message, ...messages]);
    };

    socketLocal.on("message", receiveMessage);

    return () => {
      socketLocal.off("message", receiveMessage); // Desuscribir el componente
    };
  });

  useEffect(() => {
    console.log("envia una vez");
    socketLocal.emit("pconnect", { event: "laptop1" });

    const receiveMessage3 = (message) => {
      console.log("pconnect", message);
    };

    socketLocal.on("pconnect", receiveMessage3);

    return () => {
      socketLocal.off("pconnect", receiveMessage3); // Desuscribir el componente
    };
  }, []);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <div className="h-screen bg-zinc-800 text-white flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-10">
        <h1 className="text-2xl- font-bold my-2">Chat UABCS</h1>
        <input
          type="text"
          name=""
          id=""
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          className="border-2 border-zinc-500 p-2 text-black w-full"
        />
        {/* <button className="bg-blue-500">send</button> */}

        <ul className="h-80 overflow-y-auto">
          {messages.map((message, index) => (
            <li
              key={index}
              className={`my-2 p-2 table text-sm rounded-md ${
                message.from === "Me" ? "bg-sky-700 ml-auto" : "bg-black"
              }`}
            >
              <p>
                {message.from}:{message.body}
              </p>
            </li>
          ))}
        </ul>
      </form>
    </div>
  );
}

export default App;
