import io from 'socket.io-client';
import { BASE_URL } from './constants';

export const createSocketConnection = () => {
    if(location.hostname === "localhost", { transports: ["websocket"] }){
        console.log("socket connection stablished")
        return io(BASE_URL)
    } else {
        return io(BASE_URL, {path: "/socket.io"});
    }
};