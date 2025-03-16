import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { BASE_URL, FRONTEND_BASE_URL } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import { removeRequest, setRequests } from '../utils/requestSlice'
import { sendPushNotification } from '../utils/notification'

const Requests = () => {
    // const [requests, setRequests] = useState([]);
    const requests  = useSelector(store => store.request);
    const user = useSelector(store => store.user);
    const dispatch = useDispatch();
    const getRequests = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/user/requests/received`, {withCredentials: true});
            // console.log(res.data.data);
            dispatch(setRequests(res.data.data));
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        getRequests();
    },[]);

    const handleRequest = async (request,status) => {
        try {
            const res = await axios.post(`${BASE_URL}/request/review/${status}/${request._id}`, {}, {withCredentials: true});
            console.log(res);
            if(status === "accepted"){
                const title = "connection request accepted.";
                const linkUrl = `${FRONTEND_BASE_URL}/connections`
                const text = `${user.firstName + " " + user.lastName} accepted your connection request.`
                const targetUserId = request.fromUserId._id;
                sendPushNotification(targetUserId,title, text, linkUrl);
            }
            dispatch(removeRequest(res.data.data._id))
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className=''>
            <h1 className='text-3xl text-center my-4' >Requests</h1>
            <p className='mt-5  text-center'>{requests == "" ? "no requests available" : ""}</p>
            <ul className="list bg-base-100 rounded-box shadow-md min-h-[75vh] ">
    
            {requests?.map((request,i) => {
                return(
                    <div key={i} className='flex '>
                    <li  className="list-row  flex gap-2 m-2 md:px-10 bg-base-200 p-4 mx-auto rounded-lg w-full md:w-2/3 lg:w-1/2 justify-between">
                        <div className='flex gap-2'>
    
                        <div><img className="size-10 rounded-box" src={request.fromUserId.photoUrl}/></div>
                        <div>
                        <div className='text-xl' >{request.fromUserId.firstName + " " + request.fromUserId.lastName}</div>
                        <div className="text-xs uppercase font-semibold opacity-60">{request.fromUserId.about}</div>
                        </div>
                        </div>
    
                        <div className=''>
                        <button onClick={() => {handleRequest(request,"accepted")}} className="btn btn-square  bg-primary text-base-100 btn-ghost mx-2">
                        accept
                        </button>
                        <button onClick={() => {handleRequest(request,"rejected")}} className="btn btn-square bg-secondary text-base-100 btn-ghost">
                        reject
                        </button>
                        </div>
                    </li>
                </div>
            )
        })}
        </ul>
        </div>
      )
}

export default Requests;