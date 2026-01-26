export const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    try {
        const item = localStorage.getItem('user');
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
};

export const setStoredUser = (user: any, token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
};

export const clearStoredAuth = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
}

export const getStoredToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}
