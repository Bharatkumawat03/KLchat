import { createSlice } from "@reduxjs/toolkit";


const requestSlice = createSlice({
    name: 'request',
    initialState: [],
    reducers: {
        setRequests(state, action) {
            return action.payload;
        },
        removeRequest(state, action) {
            const newRequests = state.filter(req => req._id !== action.payload);
            return newRequests;
        }
    }

})

export const {setRequests, removeRequest} = requestSlice.actions;

export default requestSlice.reducer;