import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import './ChatContainer.css';

// Import GoogleGenerativeAI at the top of the file
const { GoogleGenerativeAI } = require("@google/generative-ai");

const ChatContainer = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello, Myself Abhishek.(Pls tell me how many words you want also)",
      role: "user"
    },
    {
      text: "Great to meet you. What would you like to know?",
      role: "model"
    }
  ]);

  const chatContainerRef = useRef(null);

  const addMessage = async (message) => {
    // Add user message to state
    setMessages([...messages, { text: message, role: 'user' }]);

    // Set up Google Generative AI API call
    const genAI = new GoogleGenerativeAI("AIzaSyCt1pQBINL7QDeLyThqtWIPwZIMqopUoM4");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chatHistory = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    chatHistory.push({ role: 'user', parts: [{ text: message }] });

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessageStream(message);

    // Add a placeholder for the model's response
    setMessages((prevMessages) => [...prevMessages, { text: '', role: 'model' }]);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText);
      
      // Split chunk into words
      const words = chunkText.split(' ');

      // Update the last message (model's response) with each word
      for (const word of words) {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1].text += word + ' ';
          return updatedMessages;
        });

        // Optional: Adjust the timing between each word
        await new Promise(resolve => setTimeout(resolve, 200)); // Adjust timing as needed
      }

      // Scroll to the bottom of the chat container after updating messages
      scrollToBottom();
    }
  };

  // Function to scroll chat container to the bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Automatically scroll to bottom on initial load and whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-container" ref={chatContainerRef}>
      <ChatMessage messages={messages} />
      <ChatInput addMessage={addMessage} />
    </div>
  );
};

export default ChatContainer;
