import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosClient } from "../../utils/axiosClient";

export const getMyInfo = createAsyncThunk("user/getMyInfo", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosClient.get("/users/getMyInfo");
    return res.data.result;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

export const updateMyProfile = createAsyncThunk("user/updateProfile", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosClient.put("/users/updateUser", data);
    return res.data.result;
  } catch (e) {
    return rejectWithValue(e.response?.data || e.message);
  }
});

const appConfigSlice = createSlice({
  name: "appConfig",
  initialState: {
    isLoading: false,
    myProfile: {},
    toastData: {},
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    showToast: (state, action) => {
      state.toastData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyInfo.fulfilled, (state, action) => {
        state.myProfile = action.payload?.User ?? action.payload ?? {};
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload?.User ?? action.payload ?? {};
      })
      .addCase(getMyInfo.rejected, (state) => {
        state.myProfile = {};
      });
  },
});

export default appConfigSlice.reducer;
export const { setLoading, showToast } = appConfigSlice.actions;
