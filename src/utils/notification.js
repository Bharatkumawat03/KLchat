import { postApi } from "./api";
import { FRONTEND_BASE_URL } from "./constants";

export const sendPushNotification = async (userId, title, body, url) => {
  try {
    const linkUrl = FRONTEND_BASE_URL + url;
    const response = await postApi("/send-notification", {
      userId,
      title,
      body,
      linkUrl,
    });

    if (response.data && response.data.success) {
      console.log("notification sent successfully ", response.data);
      return response.data;
    } else {
      console.error(
        "failed to send notification ",
        response.data?.error || "unknown error"
      );
      return null;
    }
  } catch (error) {
    console.error("error sending notification ", error);
  }
};

// export const sendPushNotification = async (title, body) => {
//     if (!('serviceWorker' in navigator)) {
//         console.error('service workers are not supported in this browser');
//         return;
//     }
//     const registration = await navigator.serviceWorker.getRegistration();
//     if (registration) {
//         registration.showNotification(title, {
//             body,
//             // icon: '/firebase-logo.png'
//         });
//     } else {
//         console.error('service worker registration not found');
//     }
// };
