import React, { useEffect, useState } from 'react'
import Navbar from '../componenets/Navbar'
import Footer from '../componenets/Footer'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { setFeed } from '../utils/feedSlice';
import PushNotificationBanner from '../componenets/PushNotificationBanner';
import { getMessaging, onMessage } from 'firebase/messaging';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const Body = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const user = useSelector((store) => store.user);
    const user = localStorage.getItem("user");

  const loc = useLocation();
  const {targetUserName} = useParams();
  const [currentChatUserName, setCurrentChatUserName] = useState(null);

  useEffect(() => {
    setCurrentChatUserName(targetUserName);
  }, [loc, targetUserName]);

  useEffect(() => {
    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Received foreground message: ', payload);
      
      console.log(currentChatUserName);
      const { title } = payload.data;

      console.log(title === currentChatUserName);
      if(title === targetUserName) return ;
      
      toast(
        <div>
          <strong>{payload.data.title}</strong>
          <br />
          {payload.data.body}
        </div>, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClick: () => {
            const link = payload.data.click_action;
            window.location.href = link;
          },
        }
      );
    });
  
    return () => unsubscribe();
  }, [currentChatUserName]); 



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

  
  const checkAuth = () => {
    const token = Cookies.get('token');
    if (!token) {
      localStorage.clear();
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  
  useEffect(() => {
    if(!user)(
      navigate('/login')
    )
  },[]);


  return (
    <div>
        <Navbar />
        <PushNotificationBanner />
        <div className='min-h-[82.5vh]'>
        <Outlet />
        </div>
        <Footer />
    </div>
  )
}

export default Body