import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", ({ userId, role }) => {
      console.log("JOIN EVENT RECEIVED");
      console.log("UserId:", userId);
      console.log("Role:", role);

      socket.join(userId);

      if (role === "user") {
        socket.join("users");
        console.log("Joined users room");
      }

      console.log("Rooms:", [...socket.rooms]);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};
