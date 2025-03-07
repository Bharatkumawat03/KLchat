import { configureStore } from "@reduxjs/toolkit";
import userReducer from './userSlice';
import feedReducer from './feedSlice'
import chatReducer from './chatSlice';
import requestReducer from './requestSlice'

const appstore = configureStore({
    reducer: {
        user: userReducer,
        feed: feedReducer,
        chat: chatReducer,
        request: requestReducer
    },
})

export default appstore;