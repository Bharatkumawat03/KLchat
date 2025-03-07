import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setMessage } from '../utils/chatSlice';
import { createSocketConnection } from '../utils/socket';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useParams } from 'react-router-dom';
import { LiaCheckDoubleSolid } from "react-icons/lia";

const Chat = () => {
    const [text, setText] = useState("");
    const dispatch = useDispatch();
    const {targetUserId, targetUserName} = useParams();
    // const [senderId, setSenderId] = useState();

    const user = useSelector((store) => store.user);
    const userId = user?._id;
    const msgs = useSelector((store) => store.chat);
    // console.log("hererer",msgs);

    const handleSendChat = async (e) => {
        e.preventDefault();
        try {
            const data = {
                firstName: user.firstName,
                lastName: user.lastName,
                userId: user._id,
                targetUserId,
                text
            }
            
            const socket = createSocketConnection();
            socket.emit("sendMessage",data, (res) => {
                // console.log(res);
            });
            
            // dispatch(addMessage(text));
            setText("");
            scrollToBottom()

        } catch (error) {
            console.error(error);
        }
    }
    
    const scrollToBottom = () => {
        const div = document.getElementById("chat");
        // console.log(div);
        div.scrollTop = div.scrollHeight;
    };
    
    const getChat = async () => {
        try {
            // console.log(targetUserId);
            const res = await axios.get(`${BASE_URL}/chat/${targetUserId}`,{withCredentials: true});
            // console.log(res.data);
            dispatch(setMessage(res.data.messages))
            // scrollToBottom();
        } catch (error) {
            console.error(error);
        }
    }
    
    useEffect(() => {
        getChat()
        scrollToBottom()
    },[]);

    const msgsRef = useRef(msgs);

    useEffect(() => {
        msgsRef.current = msgs;
    }, [msgs]);

    useEffect(() => {
        if(!userId) return;
        const data = {
            firstName: user.firstName, 
            userId, 
            targetUserId
        }
        const socket = createSocketConnection();
        socket.emit("joinChat",data)
        console.log("join chat");
    
        socket.on("messageReceived", ({firstName, lastName, text, status}) =>{
            const dd = {
                senderId:{
                    firstName, lastName, _id: userId
                },
                text,
                status,
                createdAt: new Date().toLocaleString()
            }
            console.log(dd);
            dispatch(addMessage(dd));
            scrollToBottom()

            socket.emit("messageSeen", { userId, targetUserId });
        })


        socket.on("messagesSeen", ({ userId, targetUserId }) => {
            const currentMessages =  [...msgsRef.current];
            // console.log("current msgs", currentMessages); 
        
            if (!currentMessages || currentMessages.length === 0) {
                console.log("No msgs for update");
                return;
            }
        
            const updatedMessages = currentMessages.map(msg => 
                msg.senderId._id === targetUserId && msg.status === "delivered"
                    ? { ...msg, status: "seen" }
                    : msg
            );
        
            console.log("Updated msgs", updatedMessages);
        
            if (updatedMessages.length > 0) {
                dispatch(setMessage(updatedMessages));
            }
        });
    

        socket.emit("messageSeen", { userId, targetUserId });
        
        return () => {
            socket.disconnect();
            console.log("disconnected")
        }
      },[userId, targetUserId]);

    useEffect(() => {
        scrollToBottom()
    })

    
    return (
    <div  className='list bg-base-100 rounded-box shadow-md h-full md:w-[70vw] mx-auto'>
        <h1 className='text-3xl font-bold p-2 border-b-4 border-base-200'>{targetUserName}</h1>
        <div id='chat'  className='scroll-container overflow-y-auto'>

        <div className='scroll-container h-[71vh] p-4'>

        {msgs?.map((msg,index) => {
            const isSentByUser = msg?.senderId?.firstName === user.firstName;
            const seenIconColor = msg.status === "seen" ? "#1E90FF" : "#6C757D";
            return (
                <div key={index} className={`chat ${isSentByUser ? "chat-end":"chat-start"} `}>
                    
            <div className={` flex chat-bubble ${isSentByUser ? "bg-primary glass text-base-300" : ""} `}>{msg.text}

            </div>
            <div className="flex gap-1 chat-footer opacity-50">
                <time className="text-xs opacity-50">{msg?.createdAt?.substring(11,16)}</time>
                {isSentByUser ?<LiaCheckDoubleSolid  fill={seenIconColor} />: ""}
                {/* <p>{isSentByUser ?msg.status: ""}</p> */}
            </div>
            </div>
)
})}
        </div>
</div>

        <div className='bg-base-200 p-2 flex gap-2 '>
        <input type="text" placeholder="Type here" className="input w-full" value={text} onChange={(e) => setText(e.target.value)} />
        <button className='btn bg-secondary glass text-white' onClick={handleSendChat} >Send</button>
        </div>
    </div>
  )
}

export default Chat