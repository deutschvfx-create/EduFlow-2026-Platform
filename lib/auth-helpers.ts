import { safeGet, safeSet, safeRemove } from "./storage";

export const getStoredUser = () => {
    return safeGet<any>('user', null);
};

export const setStoredUser = (user: any, token: string) => {
    safeSet('user', user);
    safeSet('token', token);
};

export const clearStoredAuth = () => {
    safeRemove('user');
    safeRemove('token');
}

export const getStoredToken = () => {
    return safeGet<string | null>('token', null);
}
