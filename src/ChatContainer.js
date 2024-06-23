import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import './ChatContainer.css';

// Import GoogleGenerativeAI at the top of the file
const { GoogleGenerativeAI } = require("@google/generative-ai");

const ChatContainer = () => {
  const [messages, setMessages] = useState([
    {
      text: "Hello, Myself Abhishek.",
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
    const newUserMessage = { text: message, role: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);

    // Set up Google Generative AI API call
    const genAI = new GoogleGenerativeAI("AIzaSyCt1pQBINL7QDeLyThqtWIPwZIMqopUoM4");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chatHistory = [...messages, newUserMessage].map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    try {
      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      let totalWords = 0;
      const maxWords = 500;

      const result = await chat.sendMessageStream(message);

      for await (const chunk of result.stream) {
        if (totalWords >= maxWords) {
          break;
        }

        const chunkText = chunk.text();
        console.log(chunkText);

        // Split chunk into words
        const words = chunkText.split(' ');

        // Add model's response as separate messages
        for (const word of words) {
          setMessages(prevMessages => {
            const lastMessageIndex = prevMessages.length - 1;
            const updatedMessages = [...prevMessages];

            // If last message is from user, add new model message
            if (updatedMessages[lastMessageIndex].role === 'user') {
              updatedMessages.push({ text: '', role: 'model' });
            }

            // Append word to the latest model message
            updatedMessages[updatedMessages.length - 1].text += word + ' ';

            return updatedMessages;
          });

          totalWords += 1;

          // Optional: Adjust the timing between each word
          await new Promise(resolve => setTimeout(resolve, 200)); // Adjust timing as needed
        }

        // Scroll to the bottom of the chat container after updating messages
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      if (error.message.includes('SAFETY')) {
        // Handle SAFETY error, e.g., display error message to user
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'Sorry, I cannot respond to that due to safety concerns.', role: 'model' }
        ]);
      } else {
        // Handle other errors as needed
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'Oops! Something went wrong. Please try again later.', role: 'model' }
        ]);
      }
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
