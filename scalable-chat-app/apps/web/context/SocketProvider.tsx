"use client";
import React, { useCallback, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  children: React.ReactNode;
}

interface ISocketContext {
  socket: Socket | undefined;
  sendMessage: (message: string) => void;
  messages: Record<string, string>[];
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<Record<string, string>[]>([]);
  const sendMessage = useCallback(
    (message: string) => {
      console.log("Sendng message", message);
      socket?.emit("event:message", { message });
    },
    [socket],
  );

  const onMessageReceived = useCallback(
    (message: string) => {
      console.log("Received message", message);
      setMessages((prev) => [
        ...prev,
        JSON.parse(message) as { message: string },
      ]);
    },
    [messages],
  );

  useEffect(() => {
    const _socket = io("https://fthfv3-8000.csb.app");
    setSocket(_socket);

    _socket.on("message", onMessageReceived);

    return () => {
      _socket.disconnect();
      _socket.off("message", onMessageReceived);
      setSocket(undefined);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socketContext = React.useContext(SocketContext);
  if (!socketContext) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socketContext;
};
