import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyABLLZ03nT6SOx6pF1md7pltwigQA4sH7c",
  authDomain: "firbasepushnotifiaction.firebaseapp.com",
  projectId: "firbasepushnotifiaction",
  storageBucket: "firbasepushnotifiaction.appspot.com",
  messagingSenderId: "558676836712",
  appId: "1:558676836712:web:d09aa84bc2ab257c4256dd",
  measurementId: "G-57VBPJEN9M",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestPermission = () => {
  console.log("request permission user....!!");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification user permission granted");
      return getToken(messaging, {
        vapidKey:
          "BNKMOO3irg0iZT1UibvMzrjes_ifbMaPA18Sa4kHbV6xbwGhS0KnQQbjUW_55ZnOHodGW41Lua4pW859TrTKZ70",
      })
        .then((currentToken) => {
          if (currentToken) {
            console.log("currentToken", currentToken);
            return currentToken;
          } else {
            console.log("failed to generated the app registration token");
          }
        })
        .catch((err) => {
          console.log(
            "An error occured when requesting to receive thw token.",
            err
          );
        });
    } else {
      console.log("Notification user permission denied");
    }
  });
};

requestPermission();
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("payload", payload);
      resolve(payload);
    });
  });
