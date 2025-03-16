import React, { useEffect } from 'react'
import { messaging } from '../utils/firebase'

const PushNotificationButton = () => {
    useEffect(() => {
        messaging.requestPermission()
        .then(()=>{
            return messaging.getToken();
        })
        .then(()=>{
            console.log('Token:', token);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    },[])
  return (
    <button>Enable Push Notifications</button>
  )
}

export default PushNotificationButton