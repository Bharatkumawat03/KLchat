import { Routes, Route, BrowserRouter, useParams } from "react-router-dom";
import Body from "./pages/Body";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { toast, ToastContainer } from "react-toastify";
import Connections from "./pages/Connections";
import Requests from "./pages/Requests";
import Profile from "./pages/Profile";
import Chat from "./componenets/Chat";
import { useEffect } from "react";
import {
  getOrRegisterServiceWorker,
  onForegroundMessage,
} from "./utils/firebase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import VideoCall from "./componenets/VideoCall";
import { sendPushNotification } from "./utils/notification";
import { NotificationProvider } from "./componenets/NotificationContext";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    getOrRegisterServiceWorker();
  }, []);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data;

      if (data.type === "INCOMING_CALL") {
        console.log("Incoming call notification received:", data.payload);

        const ringtoneUrl = "/call.mp3";
        const audio = new Audio(ringtoneUrl);
        audio.loop = true;
        audio.play().catch((error) => {
          console.error("Error playing ringtone:", error);
        });

        window.currentRingtone = audio;

        navigator.serviceWorker.addEventListener("notificationclick", () => {
          if (window.currentRingtone) {
            window.currentRingtone.pause();
            window.currentRingtone.currentTime = 0;
            window.currentRingtone = null;
          }
        });

        navigator.serviceWorker.addEventListener("notificationclose", () => {
          if (window.currentRingtone) {
            window.currentRingtone.pause();
            window.currentRingtone.currentTime = 0;
            window.currentRingtone = null;
          }
        });
      } else if (data.type === "CALL_TIMEOUT") {
        console.log("Call time out", data.payload);

        if (window.currentRingtone) {
          window.currentRingtone.pause();
          window.currentRingtone.currentTime = 0;
          window.currentRingtone = null;
        }
      } else if (data.type === "CALL_REJECTED") {
        console.log("Call rejected", data.payload);

        if (window.currentRingtone) {
          window.currentRingtone.pause();
          window.currentRingtone.currentTime = 0;
          window.currentRingtone = null;
        }

        console.log("target user id", data.payload.senderId);
        console.log("target user id", data.payload);
        sendPushNotification(
          data.payload.senderId,
          "Call Rejected",
          "Call rejected.",
          "/"
        );
      } else if (data.type === "CALL_ACCEPTED") {
        console.log("Call accepted:", data.payload);

        if (window.currentRingtone) {
          window.currentRingtone.pause();
          window.currentRingtone.currentTime = 0;
          window.currentRingtone = null;
        }

        window.location.href = data.payload.click_action;
      } else if (data.type === "CALL_ENDED") {
        console.log("Call ended:", data.payload);

        if (window.currentRingtone) {
          window.currentRingtone.pause();
          window.currentRingtone.currentTime = 0;
          window.currentRingtone = null;
        }
      }
    });
  }

  // if ("serviceWorker" in navigator) {
  //   navigator.serviceWorker.addEventListener("message", (event) => {
  //     if (event.data && event.data.type === "INCOMING_CALL") {
  //       console.log("Incoming call notification received:", event.data.payload);

  //       const ringtoneUrl = "/call.mp3";
  //       const audio = new Audio(ringtoneUrl);
  //       audio.loop = true;
  //       audio.play().catch((error) => {
  //         console.error("Error playing ringtone:", error);
  //       });

  //       navigator.serviceWorker.addEventListener("notificationclick", () => {
  //         audio.pause();
  //         audio.currentTime = 0;
  //       });

  //       navigator.serviceWorker.addEventListener("notificationclose", () => {
  //         audio.pause();
  //         audio.currentTime = 0;
  //       });
  //     }
  //   });
  // }

  return (
    <>
    <NotificationProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/">
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Body />}>
              <Route index element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/chat/:targetUserId/:targetUserName"
                element={<Chat />}
              />
              <Route
                path="/call/:targetUserId/:targetUserName"
                element={<VideoCall />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      </NotificationProvider>
    </>
  );
}

export default App;
