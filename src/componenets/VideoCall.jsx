import React, { useEffect, useRef, useState } from "react";
import { createSocketConnection } from "../utils/socket";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { sendPushNotification } from "../utils/notification";
import { toast } from "react-toastify";
import { getMessaging, onMessage } from "firebase/messaging";
import { useNotification } from "./NotificationContext";
import { IoMic, IoMicOff } from "react-icons/io5";
import { MdCallEnd } from "react-icons/md";

const VideoCall = () => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const socket = useRef(null);
  const candidateQueue = useRef([]);
  const callTimeout = useRef(null);

  const { notification, setNotification } = useNotification();

  const [status, setStatus] = useState("Initializing");
  const [isInitiator, setIsInitiator] = useState(false);
  const [ready, setReady] = useState({
    local: false,
    peer: false,
    socket: false,
  });
  const [audioMuted, setAudioMuted] = useState(false);

  const navigate = useNavigate();
  const { targetUserId, targetUserName } = useParams();
  const user = useSelector((store) => store.user);
  const userId = user?._id;

  const configuration = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  useEffect(() => {
    if (!userId || !targetUserId) return;

    socket.current = createSocketConnection();

    socket.current.on("connect", () => {
      setReady((prev) => ({ ...prev, socket: true }));
      console.log("Socket connected");

      socket.current.emit("joinChat", {
        firstName: user.firstName,
        userId,
        targetUserId,
      });

      socket.current.emit("videoCall", {
        type: "join",
        userId,
        targetUserId,
        timestamp: Date.now(),
      });
    });

    socket.current.on("disconnect", () => {
      setReady((prev) => ({ ...prev, socket: false }));
      console.log("Socket disconnected");
    });

    return () => {
      handlePeerDisconnect();
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userId, targetUserId, user]);

  useEffect(() => {
    if (!ready.socket) return;

    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStream.current = stream;
        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }

        socket.current.emit("videoCall", {
          type: "ready",
          userId,
          targetUserId,
        });

        setReady((prev) => ({ ...prev, local: true }));
        setStatus("waiting for peer");

        // const title = `incoming call`;
        // const text = `${user.firstName} is calling you`;
        // const linkUrl = `/call/${userId}/${user.firstName + "%20" + user.lastName}`
        // sendPushNotification(targetUserId, title, text, linkUrl);
      } catch (err) {
        console.error("media error", err);
        setStatus(`error ${err.message}`);
        alert(`could not access camera/microphone, ${err.message}`);
      }
    }

    setupMedia();

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [ready.socket, userId, targetUserId]);

  useEffect(() => {
    if (!socket.current) return;

    const handleSignal = async (event) => {
      const isForUs = event.targetUserId === userId;
      const isFromTarget = event.userId === targetUserId;

      if (!isForUs && !isFromTarget) return;

      console.log("signal", event.type);

      switch (event.type) {
        case "join":
          if (event.userId === targetUserId) {
            const theirTime = event.timestamp || 0;
            const ourTime = Date.now();

            const initiator = ourTime - theirTime > 2000 ? false : true;
            console.log(
              `join timestamps - theirs: ${theirTime}, ours: ${ourTime}, I am ${
                initiator ? "initiator" : "receiver"
              }`
            );
            setIsInitiator(initiator);

            if (callTimeout.current) {
              clearTimeout(callTimeout.current);
              callTimeout.current = null;
            }
          }
          break;

        case "ready":
          if (event.userId === targetUserId) {
            setReady((prev) => ({ ...prev, peer: true }));
          }
          break;

        case "offer":
          if (!isInitiator) {
            await handleOffer(event);
          }
          break;

        case "answer":
          if (isInitiator && peerConnection.current) {
            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription({ type: "answer", sdp: event.sdp })
            );
            processQueuedCandidates();

            if (callTimeout.current) {
              clearTimeout(callTimeout.current);
              callTimeout.current = null;
            }
          }
          break;

        case "candidate":
          handleIceCandidate(event);
          break;

        case "bye":
          handlePeerDisconnect();
          if (callTimeout.current) {
            clearTimeout(callTimeout.current);
            callTimeout.current = null;
          }
          break;
      }
    };

    callTimeout.current = setTimeout(() => {
      console.log("receiver did not join. Hanging up.");
      setStatus("Receiver did not join");
      endCall(true);
      toast("Call ended: Receiver did not join", {
        position: "top-center",
        hideProgressBar: true,
        closeOnClick: false,
      });
    }, 10000);

    socket.current.on("videoCall", handleSignal);

    return () => {
      if (socket.current) {
        socket.current.off("videoCall", handleSignal);
      }
    };
  }, [userId, targetUserId, isInitiator]);

  useEffect(() => {
    if (!ready.local || !ready.peer || !ready.socket) return;

    if (isInitiator && !peerConnection.current) {
      console.log("Both ready and I'm initiator - starting call");
      setTimeout(startCall, 1000);
    }
  }, [ready, isInitiator]);

  function createPeerConnection() {
    if (peerConnection.current) return peerConnection.current;

    try {
      const pc = new RTCPeerConnection(configuration);

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.current.emit("videoCall", {
            type: "candidate",
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
            userId,
            targetUserId,
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideo.current && event.streams[0]) {
          remoteVideo.current.srcObject = event.streams[0];
          setStatus("Connected");
        }
      };

      pc.onconnectionstatechange = () => {
        setStatus(`Connection: ${pc.connectionState}`);
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
          handlePeerDisconnect();
        }
      };

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStream.current);
        });
      }

      peerConnection.current = pc;
      return pc;
    } catch (err) {
      console.error("Peer connection error:", err);
      setStatus(`Error: ${err.message}`);
      return null;
    }
  }

  async function startCall() {
    try {
      setStatus("Calling");
      const pc = createPeerConnection();
      if (!pc) return;

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await pc.setLocalDescription(offer);

      socket.current.emit("videoCall", {
        type: "offer",
        sdp: offer.sdp,
        userId,
        targetUserId,
      });

      // callTimeout.current = setTimeout(() => {
      //   console.log('Call timed out. Hanging up.');
      //   setStatus('Call timed out');
      //   endCall(true);
      //   toast("Not answered call");
      // }, 3000);
    } catch (err) {
      console.error("Call error:", err);
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleOffer(offer) {
    try {
      setStatus("Receiving call");
      const pc = createPeerConnection();
      if (!pc) return;

      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: "offer", sdp: offer.sdp })
      );

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.current.emit("videoCall", {
        type: "answer",
        sdp: answer.sdp,
        userId,
        targetUserId,
      });

      processQueuedCandidates();

      if (callTimeout.current) {
        clearTimeout(callTimeout.current);
        callTimeout.current = null;
      }
    } catch (err) {
      console.error("Answer error:", err);
      setStatus(`Error: ${err.message}`);
    }
  }

  function handleIceCandidate(candidate) {
    if (!peerConnection.current || !peerConnection.current.remoteDescription) {
      candidateQueue.current.push(candidate);
      return;
    }

    try {
      peerConnection.current.addIceCandidate(
        new RTCIceCandidate({
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        })
      );
    } catch (err) {
      candidateQueue.current.push(candidate);
    }
  }

  function processQueuedCandidates() {
    if (!peerConnection.current || !peerConnection.current.remoteDescription)
      return;

    while (candidateQueue.current.length > 0) {
      const candidate = candidateQueue.current.shift();
      handleIceCandidate(candidate);
    }
  }

  function handlePeerDisconnect() {
    setStatus("Call ended");
    endCall(false);
  }

  function endCall(sendSignal = true) {
    if (sendSignal && socket.current) {
      socket.current.emit("videoCall", {
        type: "bye",
        userId,
        targetUserId,
      });
      sendPushNotification(targetUserId, "Call Ended", "Call ended.", "/");
      if (callTimeout.current) {
        clearTimeout(callTimeout.current);
        callTimeout.current = null;
      }
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    setTimeout(() => {
      navigate(`/chat/${targetUserId}/${targetUserName}`);
    }, 1000);
  }

  function toggleMute() {
    if (localStream.current) {
      const newState = !audioMuted;
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !newState;
      });
      setAudioMuted(newState);
    }
  }

  useEffect(() => {
    if (notification) {
      const { title } = notification.data;
      // const messaging = getMessaging();
      // const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Received foreground message: ", notification.data);

      // console.log(currentChatUserName);
      // const { title } = payload.data;

      if (title === "Call Rejected") {
        endCall(false);
        if (callTimeout.current) {
          clearTimeout(callTimeout.current);
          callTimeout.current = null;
        }
      }
      // })

      //   return () => unsubscribe();
      // }, [targetUserName]);
      setNotification(null);
    }
  }, [notification, setNotification]);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data;

      if (data.type === "CALL_ENDED") {
        console.log("Call ended:", data.payload);
        endCall(true);
        if (window.currentRingtone) {
          window.currentRingtone.pause();
          window.currentRingtone.currentTime = 0;
          window.currentRingtone = null;
        }
      }
    });
  }

  return (
    <div className="w-full h-screen bg-base-200 flex items-center justify-center fixed inset-0 z-50">
      <video
        ref={remoteVideo}
        autoPlay
        playsInline
        className="absolute w-full md:w-[70%] mx-auto h-full object-cover rounded-md"
      />

      <div className="absolute bottom-4 right-4 w-24 h-32 md:w-1/4 md:h-auto bg-gray-800 rounded-md overflow-hidden shadow-lg">
        <video
          ref={localVideo}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          onClick={() => endCall(true)}
          className="bg-red-500 w-10 h-10 hover:bg-red-600 text-white p-3 rounded-full shadow-lg"
        >
          <MdCallEnd />
        </button>

        <button
          onClick={toggleMute}
          className="bg-blue-500 w-10 h-10 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          {audioMuted ? <IoMicOff /> : <IoMic />}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
