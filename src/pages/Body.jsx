import React, { useEffect, useState } from 'react'
import Navbar from '../componenets/Navbar'
import Footer from '../componenets/Footer'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { addUser } from '../utils/userSlice';
import PushNotificationBanner from '../componenets/PushNotificationBanner';
import { getMessaging, onMessage } from 'firebase/messaging';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import { getUser } from '../utils/api';

const Body = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const user = useSelector((store) => store.user);
    const user = localStorage.getItem("user");
    console.log("user from local", user);

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


  // const getUser = async () => {
  //   const {data} = await axios.get(BASE_URL + "/profile/view", {withCredentials: true});
  //   // localStorage.setItem("user", JSON.stringify(res.data));
  //   return data;
  // }

  const {data: userData} = useQuery({queryKey: ["user"], queryFn: getUser});
  console.log("user data ", userData);
  useEffect(() => {
    if (userData) {
      dispatch(addUser(userData));
    }
  }, [userData, dispatch]);

  // const getUser = async () => {
  //   try {
  //       const res = await axios.get(BASE_URL + "/profile/view", {withCredentials: true});
  //       // console.log(res.data);
  //       dispatch(addUser(res.data));
  //   } catch (error) {
  //       console.log(error);
  //   }
  // }

  // useEffect(() => {
  //   getUser();
  // }, []);


  // const getFeed = async () => {
  //   const {data} = await axios.get(BASE_URL + "/feed", {withCredentials: true});
  //   return data;
  // }

  // const {data} = useQuery({queryKey: ["feed"], queryFn: getFeed});
  // console.log(data);
  
  // const getFeed = async () => {
  //   try {
  //     const res = await axios.get(BASE_URL + "/feed", {withCredentials: true});
  //     // console.log(res.data.data);
  //     dispatch(setFeed(res.data.data));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  
  // useEffect(()=>{
  //   getFeed();
  // },[user]);

  
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