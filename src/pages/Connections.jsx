import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { BASE_URL } from '../utils/constants'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Connections = () => {
    const [connections, setConnections] = useState();
    const navigate = useNavigate();
    const user = useSelector((store) => store.user);

    const getConnections = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/user/connections`, {withCredentials: true});
            // console.log(res.data.data);
            setConnections(res.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getConnections();
    },[]);

    const handleChat = async (connection) => {
        try {
            const data = {
                firstName: user.firstName,
                userId: user._id,
                targetUserId: connection._id
            }
            
            // if(socket.disconnected){
            //     socket.connect()
            // }
            // if(socket.disconnected){
                // socket.on('connect',()=>{
                //     console.log('connect', socket.connected);
                //     socket.emit("joinChat",data)
                // })
                // }
                // socket.connect();
                // socket.emit("joinChat",data)
            // console.log("join");
            navigate("/chat/"+connection._id+"/"+connection.firstName+" "+connection.lastName);
        } catch (error) {
            console.error(error);
        }
    }


  return (
    <div className=''>
        <h1 className='text-3xl text-center my-4 ' >Connections</h1>
        <p className='mt-5  text-center'>{connections == "" ? "no connections" : ""}</p>
        <ul className="list bg-base-100 rounded-box shadow-md min-h-[80vh] ">

        {connections?.map((connection,index) => {
            return(
                <div  key={index} className='flex'>
                <li onClick={() => {handleChat(connection)}} className="list-row cursor-pointer hover:bg-base-300 flex gap-4 m-2 bg-base-200 p-4 px-8 mx-auto rounded-lg w-[90vw] md:w-1/2 lg:w-1/3">

                    <div><img className="size-10 rounded-box" src={connection.photoUrl}/></div>
                    <div>
                    <div className='text-xl'>{connection.firstName + " " + connection.lastName}</div>
                    <div className="text-xs uppercase font-semibold opacity-60">{connection.about}</div>
                    </div>
                </li>
            </div>
        )
    })}
    </ul>
    </div>
  )
}

export default Connections;