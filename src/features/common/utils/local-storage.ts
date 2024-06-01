import { IAuthenticatedUser } from "@/features/authentication/types";
import { decryptData, encryptData } from "./crypto";

function getLocalUser() {
  const user = localStorage.getItem("user-xpandio");
  let arrUser: IAuthenticatedUser = {
    ID: 0,
    NAME: "",
    TICKET_NO: "",
    ROLES: [],
    BASE_LOCN_ID: 0,
    AUTH_TOKEN: "",
    PHOTO_PATH: "",
    LOGGED_IN: 0,
  };
  if (user) {
    try {
      const decryptedData = decryptData(user);
      if (decryptedData) {
        arrUser = { ...decryptedData };
      }
    } catch (error) {
      arrUser = {
        ID: 0,
        NAME: "",
        TICKET_NO: "",
        ROLES: [],
        BASE_LOCN_ID: 0,
        AUTH_TOKEN: "",
        PHOTO_PATH: "",
        LOGGED_IN: 0,
      };
    }
  }

  return arrUser;
}

function getLoggedIn() {
  const loggedin = localStorage.getItem("loggedin-xpandio");
  let isLoggedIn = "No";
  if (loggedin && loggedin === "Yes") {
    isLoggedIn = "Yes";
  }

  return isLoggedIn;
}

function getCurrentTimer() {
  const timer = localStorage.getItem("timer-xpandio");
  let timeCounter = 30;
  if (timer) {
    try {
      const decryptTimer = decryptData(timer);
      timeCounter = parseInt(decryptTimer, 10);
      if (Number.isNaN(timeCounter)) {
        timeCounter = 0;
      }
    } catch (err) {
      timeCounter = 0;
    }
  }

  return timeCounter;
}

function tickTimer() {
  const timer = localStorage.getItem("timer-xpandio");
  let timeCounter = 30;
  if (timer) {
    try {
      const decryptTimer = decryptData(timer);
      timeCounter = parseInt(decryptTimer, 10);
      if (Number.isNaN(timeCounter)) {
        timeCounter = 0;
      }
      timeCounter -= 1;
    } catch (err) {
      timeCounter = 0;
    }
  }
  localStorage.setItem("timer-xpandio", encryptData(timeCounter.toString()));
}

function resetTimer() {
  localStorage.setItem("timer-xpandio", encryptData("30"));
}

function setLocalUser(user: IAuthenticatedUser) {
  localStorage.setItem("user-xpandio", encryptData(user));
  localStorage.setItem("loggedin-xpandio", "Yes");
  localStorage.removeItem("reloadcounter-xpandio");
}

function setLocalUserToken(token: string) {
  const user = getLocalUser();
  user.AUTH_TOKEN = token;
  setLocalUser(user);
}

export {
  getLocalUser,
  getCurrentTimer,
  tickTimer,
  resetTimer,
  setLocalUser,
  setLocalUserToken,
  getLoggedIn,
};
