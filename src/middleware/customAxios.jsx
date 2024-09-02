import axios from "axios";
import {getToken} from "../Store/accessStore";
import {expired, getNewToken} from "../services/auth2";
import {containToken} from "../Store/tokenSlice";


const axiosInstance = axios.create({
    baseURL:`http://localhost:8080/`,
    headers: {
        'Content-Type': 'application/json'
    },
});

const axiosInstance2 = axios.create({
    baseURL:`http://localhost:8080/`,
    headers: {
        'Content-Type': 'application/json'
    },
});


axiosInstance.interceptors.request.use(
     (config) => {
         const accessToken = getToken();
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        console.log("위치: interceptors")
        console.log(error);
        return Promise.reject(error);
    }
)

axiosInstance2.interceptors.request.use(
    (config) => {
        const accessToken = getToken();

        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => {
        console.log("위치: interceptors")
        console.log(error);
        return Promise.reject(error);
    }
)

export {axiosInstance, axiosInstance2}
