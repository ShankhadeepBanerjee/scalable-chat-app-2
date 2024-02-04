"use client";
import React, { useState } from "react";
import { useSocket } from "../context/SocketProvider";

const Page = () => {
  const { sendMessage, messages } = useSocket();
  const handleMessageSend = () => {
    sendMessage(message);
  };

  const [message, setMessage] = useState("");
  return (
    <div className="max-w-sm mx-auto bg-black text-white h-[100dvh] flex flex-col">
      <div className="flex-1">
        <ul>
          {messages.map((message, index) => (
            <li key={index}>
              <span>{message.message}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-2 text-black">
        <input type="text" onChange={(e) => setMessage(e.target.value)} />
        <button className="text-white" onClick={handleMessageSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Page;
