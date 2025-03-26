import axios from "axios";
import { BASE_URL } from "./constants";

const api = axios.create({baseURL: BASE_URL, withCredentials: true})

const getConnections = async () => {
    const {data} = await api.get('/user/connections');
    return data;
}

const getRequests = async () => {
    const {data} = await api.get('/user/requests/received');
    return data;
}

const reviewRequest = async ({request,status}) => {
    const res = await api.post(`/request/review/${status}/${request._id}`, {});
    return res;
}

const sendRequest = async ({touser, status}) => {
    const res = await api.post(`/request/send/${status}/${touser._id}`, {});
    return res;
}

const loginApi = async (data) => {
    try {
        const res = await api.post("/login", data);
        return res;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const logoutApi = async () => {
    try {
        const res = await api.post("/logout", {});
        return res;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const signupApi = async (data) => {
    try {
        const res = await api.post("/signup", data);
        return res;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getUser = async () => {
    const {data} = await api.get("/profile/view");
    return data;
}

const editProfile = async (data) => {
    const res = await api.patch('/profile/edit',data)
    return res;
}

const getFeedData = async ({pageParam}) => {
    const res = await api.get("/feed?page="+ pageParam);
    return res;
}

const getChat = async ({targetUserId}) => {
    const res = await api.get(`/chat/${targetUserId}`);
    return res;
}

const saveFcmToken = async (data) => {
    try {
        const res = await api.post('/save-token', data);
        return res;
    } catch (error) {
        console.error(error);
        throw error; 
    }
}

const sendNotification = async (data) => {
    try {
        const res = await api.post('/send-notification', data);
        return res;
    } catch (error) {
        console.error(error);
        throw error; 
    }
}

export {getConnections, getRequests, loginApi, signupApi, logoutApi, sendRequest, reviewRequest, getUser, getChat, editProfile, getFeedData, saveFcmToken, sendNotification};