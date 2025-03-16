import React, { useState } from 'react'
import { getFirebaseToken } from '../utils/firebase';

import logo from '../assets/sparky-dash-high-five.gif';
import { toast, ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux';

const PushNotificationBanner = () => {
    const user = useSelector(store => store.user);
    const [showNotiBanner, setShowNotiBanner] = useState(Notification.permission === 'default');

    const handleGetFirebaseToken = () => {
        getFirebaseToken()
          .then((firebaseToken) => {
          console.log('Firebase token: ', firebaseToken);
          if(firebaseToken) setShowNotiBanner(false);
          })
          .catch((err) => console.error('An error occured while retrieving firebase token. ', err))
    }

    const ToastifyNotification = ({title, body}) => {
        <div className="push-notification">
          <h2 className="push-notification-title text-blue-500">{title}</h2>
          <p className="push-notification-text">{body}</p>
        </div>
    }
    

  return (
    <>
    {user && <div className='app'>
      { showNotiBanner && <div className='bg-primary text-white p-5 py-3 bg-opacity-80 notification-banner'>
            <span>The app need permission to </span>
            <a href="#"
          className="notification-banner-link"
          onClick={handleGetFirebaseToken}>
           enable push notifications.</a>
        </div> }

        {/* <img src={logo} className='app-logo' alt="logo" /> */}
        {/* <button className='btn btn-primary' onClick={() => toast(<ToastifyNotification title="New Message" body="Hi there!" />)} >
        Show toast notification</button> */}

        
      <ToastContainer hideProgressBar />
    </div>}
            </>
  )
}

export default PushNotificationBanner