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
          .catch((err) => console.error('error while retrieving firebase token. ', err))
    }

    useEffect(() => {
      if (Notification.permission === 'granted') {
          setShowNotiBanner(false);
      } else {
        setShowNotiBanner(true);
      }
  }, []);
    
  return (
    <>
    {user && <div>
      { showNotiBanner && <div role="alert" className="alert alert-info alert-soft alert-vertical sm:alert-horizontal">
          <span>Enable push notifications.</span>
          <div>
            <button onClick={handleGetFirebaseToken} className="btn btn-sm btn-primary">Enable</button>
            <button onClick={() => setShowNotiBanner(false)} className="btn btn-sm btn-secondary">Cancel</button>
          </div>
        </div> 
        }
    </div>}
            </>
  )
}

export default PushNotificationBanner;