

function getCookie(name: string) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) {
            return value;
        }
    }
    return null;
}


export const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:2300/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        throw new Error('Failed to login');
    }
    const data = await response.json();
    document.cookie = `token=${data.token}`;
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('role', data.token);
    return data;
};



export const register = async (email: string, password: string, name: string, address: string, phone: string) => {
    const response = await fetch('http://localhost:2300/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, address, phone }),
    });
    if (!response.ok) {
        throw new Error('Failed to register');
    }
    const data = await response.json();
    document.cookie = `token= ${getCookie('token')}; path=/; SameSite=Lax; `;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('role', data.token);
    return data;
};

export const logout = async () => {
    const response = await fetch('http://localhost:2300/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
            "authorization": `Bearer ${getCookie('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to logout');
    }
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    return response.json();
};

export const getUser = async () => {
    const response = await fetch('http://localhost:2300/api/users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}`,
        },
    });
    console.log(response.json());
    if (!response.ok) {
        throw new Error('Failed to get user');
    }
    return response.json();
};

export const getUserById = async (id: string) => {
    const response = await fetch(`http://localhost:2300/api/user/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${document.cookie.split('token: ')[1]}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to get user');
    }
    return response.json();
};

export const updateUser = async (id: string, name: string, address: string, phone: string) => {
    const response = await fetch(`http://localhost:2300/api/user/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, address, phone }),
        headers: {
            'Authorization': `Bearer ${document.cookie.split('token: ')[1]}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to update user');
    }
    return response.json();
};

export const deleteUser = async (id: string) => {
    const response = await fetch(`http://localhost:2300/api/user/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${document.cookie.split('token: ')[1]}`,
        },
    });
    return response.json();
};


