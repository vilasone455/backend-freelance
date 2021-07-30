import axios from "axios";

export const onesignal = axios.create({
    baseURL: 'https://onesignal.com/api/v1/notifications',
    headers: {
        "Authorization" : "Basic YTQyM2Y5ZTYtZDEzZS00NmI0LWE1MWEtNDI3ZTdkMDIwY2Fk",
        "Content-Type": "application/json; charset=utf-8",
    }
});