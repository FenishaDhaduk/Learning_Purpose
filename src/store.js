import { configureStore } from "@reduxjs/toolkit";
import { rootReducers } from "./redux/reducers/main";

export const store = configureStore({ reducer: rootReducers });
