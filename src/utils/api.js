import axios from "axios";
import { BASE_URL } from "./constants";

const api = axios.create({baseURL: BASE_URL, withCredentials: true})

const getApiData = async (endpoint) => {
    const res = await api.get(endpoint);
    return res;
}

const postApi = async (endpoint, data) => {
    const res = await api.post(endpoint, data);
    return res;
}

const patchApi = async (endpoint,data) => {
    const res = await api.patch(endpoint,data);
    return res;
}

export {getApiData, postApi, patchApi};