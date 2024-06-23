import React from 'react';
import './ChatMessage.css';

const ChatMessage = ({ messages }) => {
  return (
    <div className="chat-messages">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.role}`}>
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default ChatMessage;
