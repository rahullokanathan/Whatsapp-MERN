import {React, useEffect, useState} from "react";
// import ReactDom from "react-dom";
import Chat from "./Chat";
import Sidebar from "./Sidebar";
import "./App.css";
import Pusher from "pusher-js";
import axios from "./axios";


function App() {

  const [messages,setMessages] = useState([]);

 useEffect(()=>{
  axios.get("/messages/sync").then((response)=>{
    setMessages(response.data);
  });
},[]);

  useEffect(() => {
  const pusher = new Pusher('0a28b5784b9e4c2a9ed8', {
    cluster: 'ap2'
  });

  const channel = pusher.subscribe('messages');
  channel.bind('inserted', (newMessage) =>{
    // alert(JSON.stringify(newMessage));
    setMessages([...messages,newMessage]);
  });

  return ()=>{
    channel.unbind_all();
    channel.unsubscribe();
  }

}, [messages]);

console.log(messages);

  return (
    <div className="app">
    <div className="app_body">
   <Sidebar />
   <Chat messages={messages}/>
   </div>
    </div>
  );
}

export default App;
