import React from 'react';
import ChatContainer from './ChatContainer';
import './App.css'

const App = () => {
  return (
    <>
    <div style={{background:'#85C1E9',height:'50px',display:'flex',justifyContent:'center',alignItems:'center'}}>
    <h1><center>Welcome To My-gpt</center></h1>
    </div>
    <div className="app">
      <ChatContainer />
    </div>
    </>
  );
};

export default App;
