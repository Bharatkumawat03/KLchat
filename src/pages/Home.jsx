import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { BASE_URL, FRONTEND_BASE_URL } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import Chat from '../componenets/Chat'
import { removeFeed, setFeed } from '../utils/feedSlice'
import { sendPushNotification } from '../utils/notification'

const Home = () => {
    const dispatch = useDispatch()
    const [toUserId, setToUserId] = useState(null);
    const [status, setStatus] = useState("");
    const user = useSelector((store) => store.user);

    const feed = useSelector((store) => store.feed);
    // const getUsers = async () => {
    //     try {
    //         const res = await axios.get(BASE_URL + "/feed", {withCredentials: true});
    //         console.log(res.data.data);
    //         dispatch(setFeed(res.data.data));
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // useEffect(()=>{
    //     getUsers();
    // },[]);

    const handleRequest = async (touser,status) => {
        try {
            const res = await axios.post(`${BASE_URL}/request/send/${status}/${touser._id}`, {},{withCredentials: true});
            // console.log(res.data.data);
            if(status === "interested"){
              const title = "New connection request.";
              const linkUrl = `${FRONTEND_BASE_URL}/requests`
              const text = `${user.firstName + " " + user.lastName} send connection request.`
              const targetUserId = res.data.data.toUserId;
              sendPushNotification(targetUserId,title, text, linkUrl);
            }
            dispatch(removeFeed(res.data.data.toUserId));
        } catch (error) {
            console.error(error);
        }
    }

    if(!feed) return <div>Loading...</div>
    if(feed.length === 0) return <div className='text-center m-5' >No more available users.</div>

  return (
    <>
    <div className='flex'>
        <div className='mx-auto'>
        {feed?.map((touser,index) => {
            return (
                <div key={index} className="card bg-base-200 md:w-96 shadow-sm m-4">
                <figure className="px-10 pt-10">
                  <img
                    src={touser.photoUrl}
                    alt="Shoes"
                    className="rounded-xl" />
                </figure>
                <div className="card-body items-center text-center">
                  <h2 className="card-title">{touser.firstName + " " + touser.lastName}</h2>
                  {/* <p>A card component has a figure, a body part, and inside body there are title and actions parts</p> */}
                  <p>{touser.about}</p>
                  <div className="card-actions">
                    <button onClick={()=>handleRequest(touser,"interested")} status ="Interested"  className="btn btn-primary">Interested</button>
                    <button onClick={()=>handleRequest(touser,"ignored")} status="Ignore" className="btn btn-secondary">Ignore</button>
                  </div>
                </div>
              </div>
            );
        })}

        </div>
    </div>
    </>
  )
}

export default Home