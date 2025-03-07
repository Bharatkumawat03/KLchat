import React, { useEffect } from 'react'
import Navbar from '../componenets/Navbar'
import Footer from '../componenets/Footer'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth0 } from "@auth0/auth0-react";
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { setFeed } from '../utils/feedSlice';

const Body = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const user = useSelector((store) => store.user);
    const user = localStorage.getItem("user");

  const getUser = async () => {
    try {
        const res = await axios.get(BASE_URL + "/profile/view", {withCredentials: true});
        // console.log(res.data);
        dispatch(addUser(res.data));
    } catch (error) {
        console.log(error);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  
  const getFeed = async () => {
    try {
      const res = await axios.get(BASE_URL + "/feed", {withCredentials: true});
      // console.log(res.data.data);
      dispatch(setFeed(res.data.data));
    } catch (error) {
      console.log(error);
    }
  }
  
  useEffect(()=>{
    getFeed();
  },[user]);
  
  useEffect(() => {
    if(!user)(
      navigate('/login')
    )
  },[]);

  const loc = useLocation();
  const params = useParams();
  // console.log(loc);
  useEffect(()=> {
    const {targetUserId, targetUserName} = params
    if(!targetUserId && !targetUserName){
      // if(socket.connected){
      //   console.log(params);
      //   // socket.emit("disconnect");
      //   socket.disconnect();
      //   console.log("dissconnect")
      // }
      }
  },[loc])

  return (
    <div>
        <Navbar />
        <div className='min-h-[82.5vh]'>
        <Outlet />

        </div>
        <Footer />
    </div>
  )
}

export default Body