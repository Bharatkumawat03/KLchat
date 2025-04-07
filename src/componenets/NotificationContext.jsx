import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMessaging, onMessage } from 'firebase/messaging';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const messaging = getMessaging();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('foreground message in NotificationContext', payload);
      setNotification(payload);
    });

    return () => unsubscribe();
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, setNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);