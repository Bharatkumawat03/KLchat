import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setMessage } from '../utils/chatSlice';
import { createSocketConnection } from '../utils/socket';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { sendPushNotification } from '../utils/notification';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiData } from '../utils/api';


// const pc = new RTCPeerConnection(configuration); 

// try {
//     pc.current = new RTCPeerConnection(configuration);
//     pc.current.onicecandidate = (e) => {

//     }
// } catch (error) {
    
// }

const Chat = () => {
    const [text, setText] = useState("");
    const {targetUserId, targetUserName} = useParams();
    // const dispatch = useDispatch();
    const navigate = useNavigate();
    const [msgs, setMsgs] = useState([]);

    const queryClient = useQueryClient();

    const user = useSelector((store) => store.user);
    const userId = user?._id;
    // const msgs = useSelector((store) => store.chat);
    // console.log("here",msgs);

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

            const username = user.firstName + " " + user.lastName;
            const url = `/chat/${userId}/${user.firstName + "%20" + user.lastName}`
            sendPushNotification(targetUserId,username, text, url);

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
        const {data} = await getApiData(`/chat/${targetUserId}`);
        return data?.messages;
    }

    const { data, isLoading, isError, error } = useQuery({queryKey: ["chat"], queryFn: getChat, refetchOnWindowFocus: false,
        onError: (error) => console.error("error fetching chat",error.message),
     });
    // console.log("chat ",data);
    
    useEffect(() => {
        // getChat()
        scrollToBottom()
    },[]);

    const msgsRef = useRef(data);

    useEffect(() => {
        msgsRef.current = data;
    }, [data]);


    useEffect(() => {
        if(!userId) return;
        const data = {
            firstName: user.firstName, 
            userId, 
            targetUserId
        }
        const socket = createSocketConnection();
        socket.emit("joinChat",data)
        // console.log("join chat");
    
        socket.on("messageReceived", ({firstName, lastName, text, status}) =>{
            const dd = {
                senderId:{
                    firstName, lastName, _id: userId
                },
                text,
                status,
                createdAt: new Date().toISOString()
            }
            // console.log(dd);

            queryClient.setQueryData(['chat'], (oldChat) => {
                if(!oldChat) return [dd];
                return [...oldChat, dd];
            })
            // setMsgs((prevMsgs) => [...prevMsgs, dd])
            // dispatch(addMessage(dd));
            scrollToBottom()

            socket.emit("messageSeen", { userId, targetUserId });
            // if(firstName !== user.firstName){
            //     handleNewMessage(text)
            // }
        })


        socket.on("messagesSeen", ({ userId, targetUserId }) => {
            const currentMessages =  [...msgsRef.current];
            // console.log("current msgs", currentMessages); 
        
            if (!currentMessages || currentMessages.length === 0) {
                // console.log("No msgs for update");
                return;
            }
        
            const updatedMessages = currentMessages.map(msg => 
                msg.senderId._id === targetUserId && msg.status === "delivered"
                    ? { ...msg, status: "seen" }
                    : msg
            );
        
            // console.log("Updated msgs", updatedMessages);
        
            if (updatedMessages.length > 0) {
                queryClient.setQueryData(['chat'], updatedMessages);
                // dispatch(setMessage(updatedMessages));
            }
        });
    

        socket.emit("messageSeen", { userId, targetUserId });
        
        return () => {
            socket.disconnect();
            // console.log("disconnected")
        }
      },[userId, targetUserId]);

    useEffect(() => {
        scrollToBottom()
    })

    const initiateCall = () => {
        try {
            // console.log("initiating call");
            navigate("/call/"+targetUserId+"/"+targetUserName);

            const title = 'Incoming Call';
            const text = `${user.firstName} is calling...`;
            const linkUrl = `/call/${userId}/${user.firstName + "%20" + user.lastName}`
            sendPushNotification(targetUserId, title, text, linkUrl);
        } catch (error) {
            console.log(error);
        }
    }

    
    return (
    <div  className='list bg-base-100 rounded-box shadow-md h-full md:w-[70vw] mx-auto'>
        <div className='p-2 border-b-4 border-base-200 flex justify-between'>
        <h1 className='text-3xl font-bold '>{targetUserName}</h1>
        <button onClick={() => initiateCall()} className='btn bg-secondary glass text-white'> Video Call </button>
        </div>
        <div id='chat'  className='scroll-container overflow-y-auto'>

        <div className='scroll-container h-[71vh] p-4'>
            {/* {isLoading && <p className='text-center' >Loading...</p>} */}

        {data?.map((msg,index) => {
            const isSentByUser = msg?.senderId?.firstName === user.firstName;
            const seenIconColor = msg.status === "seen" ? "#1E90FF" : "#6C757D";

            const createdAtIST = new Date(msg.createdAt).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit'
            });

            return (
                <div key={index} className={`chat ${isSentByUser ? "chat-end":"chat-start"} `}>
                    
            <div className={` flex chat-bubble ${isSentByUser ? "bg-primary glass text-base-300" : ""} `}>{msg.text}

            </div>
            <div className="flex gap-1 chat-footer opacity-50">
                <time className="text-xs opacity-50">{createdAtIST}</time>
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