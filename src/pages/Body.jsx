import React, { useEffect, useRef, useState } from 'react'
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
import { getApiData } from '../utils/api';
import Ringtone from '../assets/call.mp3';
import { sendPushNotification } from '../utils/notification';
import { useNotification } from '../componenets/NotificationContext';
import { MdCallEnd, MdVideoCall } from "react-icons/md";

const Body = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = localStorage.getItem("user");

    
  const { notification, setNotification } = useNotification();
    
  const [incomingCall, setIncomingCall] = useState(null);
  const ringtoneRef = useRef(null);

  const loc = useLocation();
  const {targetUserName} = useParams();
  const [currentChatUserName, setCurrentChatUserName] = useState(null);

  useEffect(() => {
    setCurrentChatUserName(targetUserName);
  }, [loc, targetUserName]);

  const acceptCall = (data) => {
    setIncomingCall(null);
    if (incomingCall) {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }

      window.location.href = data;
    }
  };

  const rejectCall = (data) => {
    setIncomingCall(null);
    if (incomingCall) {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }

      console.log("Call rejected");
      
      sendPushNotification(data,"Call Rejected","Call rejected.","/");
    }
  };

  useEffect(() => {
    if (notification) {
      const { title } = notification.data;
    // const messaging = getMessaging();
    // const unsubscribe = onMessage(messaging, (payload) => {
    //   console.log('Received foreground message: ', payload);
      
      // console.log(currentChatUserName);
      // const { title } = payload.data;

      // console.log(title === currentChatUserName);
      if(title === targetUserName) return ;

      if(title === "Incoming Call"){
        if (ringtoneRef.current) {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
        }

        setIncomingCall(notification.data);

        const audio = new Audio(Ringtone);
        audio.loop = true;
        audio.play();
        ringtoneRef.current = audio;

        // toast(
        //   <div className="w-[100vw] max-w-md h-auto bg-gray-900 text-white p-5 rounded-lg flex flex-col justify-center items-center shadow-lg">
        //     <p className="text-xl font-semibold">{payload.data.title}</p>
        //     <p className="text-sm text-gray-300">{payload.data.body}</p>
      
        //     <div className="flex justify-around w-full mt-4">
        //       <button 
        //         className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
        //         onClick={() => window.location.href = payload.data.click_action}
        //       >
        //         Accept
        //       </button>
        //       <button 
        //         onClick={() => rejectCall(payload.data.senderId)}
        //         className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
        //       >
        //         Reject
        //       </button>
        //     </div>
        //   </div>,
        //   {
        //     position: "top-center",
        //     autoClose: false,
        //     hideProgressBar: true,
        //     closeOnClick: false,
        //     draggable: false,
        //   }
        // );
      }
      else if(title === "Call Ended"){
        setIncomingCall(null);
        toast.dismiss();
        if (ringtoneRef.current) {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
        }
      }
      else{
        console.log("Notification link", notification?.data?.click_action);
        toast(
          <div>
            <strong>{notification.data.title}</strong>
            <br />
            {notification.data.body}
          </div>, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClick: () => {
              if (notification?.data && notification.data.click_action) {
                window.location.href = notification.data.click_action;
              } else {
                console.log("No click_action provided in notification");
              }
            },
          }
        );
      }
    // });
  
    // return () => unsubscribe();
  // }, [targetUserName, currentChatUserName, incomingCall, ringtoneRef]); 
  setNotification(null);
    }
  }, [notification, setNotification]);

  const getUser = async () => {
    const data = getApiData("/profile/view");
    return data;
  }

  const {data: userData} = useQuery({queryKey: ["user"], queryFn: getUser, refetchOnWindowFocus: false,
    onError: (error) => {console.error("error fetching user data",error.message);}
   });
  // console.log("user data ", userData);

  useEffect(() => {
    if (userData) {
      dispatch(addUser(userData.data));
    }
  }, [userData, dispatch]);
  
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


  useEffect(() => {
    if (incomingCall) {
      const timeout = setTimeout(() => {
        console.log("Incoming call timed out.");
        if (ringtoneRef.current) {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
        }
        setIncomingCall(null);
        toast.dismiss();
      }, 10000);
  
      return () => clearTimeout(timeout);
    }
  }, [incomingCall, ringtoneRef]);

  return (
    <div>
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
          <h2 className="text-white text-2xl mb-4">
            {incomingCall.body}
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => acceptCall(incomingCall.click_action)}
              className="bg-green-500 text-white px-3 py-3 rounded-full"
            >
              <MdVideoCall />
            </button>
            <button
              onClick={() => rejectCall(incomingCall.senderId)}
              className="bg-red-500 text-white px-3 py-3 rounded-full"
            >
              <MdCallEnd />
            </button>
          </div>
        </div>
      )}

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