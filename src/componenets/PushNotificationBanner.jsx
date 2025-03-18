import React, { useEffect, useState } from 'react'
import { getFirebaseToken } from '../utils/firebase';
import { useSelector } from 'react-redux';

const PushNotificationBanner = () => {

    const user = useSelector(store => store.user);
    const [showNotiBanner, setShowNotiBanner] = useState(Notification.permission === 'default');

    // const handleGetFirebaseToken = () => {
    //     getFirebaseToken()
    //       .then((firebaseToken) => {
    //       console.log('firebase token ', firebaseToken);
    //       if(firebaseToken) setShowNotiBanner(false);
    //       })
    //       .catch((err) => console.error('error getting Firebase token ', err))
    // }

    const handleGetFirebaseToken = async () => {
      try {
          const firebaseToken = await getFirebaseToken();
          if (firebaseToken) {
              setShowNotiBanner(false);
          } else {
              console.error("Failed to get Firebase token");
          }
      } catch (err) {
          console.error('error getting Firebase token', err);
      }
    };


    useEffect(() => {
      if(Notification.permission === 'granted'){
        handleGetFirebaseToken();
      }
    },[]);
  
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
      {showNotiBanner && <div role="alert" className="alert flex justify-between px-10">
          <span>Enable push notifications.</span>
          <div className=''>
            <button onClick={handleGetFirebaseToken} className="btn btn-sm btn-primary mx-3">Enable</button>
            <button onClick={() => setShowNotiBanner(false)} className="btn btn-sm btn-secondary">Cancel</button>
          </div>
        </div> 
        }
    </div>}
            </>
  )
}

export default PushNotificationBanner;