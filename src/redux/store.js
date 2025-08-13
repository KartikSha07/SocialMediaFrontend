import { configureStore } from "@reduxjs/toolkit";
import appConfigReducer from "./slice/appConfigSlice";
import postSliceReducer from "./slice/postSlice";
import feedReducer from "./slice/feedSlice";

export default configureStore({
    reducer : {
        appConfigReducer,
        postSliceReducer,
        feedReducer,
    }
})