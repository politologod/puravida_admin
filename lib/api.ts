// Primero instala axios: npm install axios
import axios from "axios";

// Configuración base de Axios
const api = axios.create({
	baseURL: "http://localhost:2300/api",
	withCredentials: true, // Esto envía cookies automáticamente
	headers: {
		"Content-Type": "application/json",
	},
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			window.location.href = "/login"; // Redirige si no autenticado
		}
		return Promise.reject(error);
	}
);

export const login = async (email: string, password: string) => {
	try {
		const response = await api.post("/auth/login", { email, password });
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to login");
		}
		throw new Error("Failed to login");
	}
};

export const register = async (
	email: string,
	password: string,
	name: string,
	address: string,
	phone: string
) => {
	try {
		const response = await api.post("/register", {
			email,
			password,
			name,
			address,
			phone,
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to register");
		}
		throw new Error("Failed to register");
	}
};

export const logout = async () => {
	try {
		const response = await api.post("/logout");
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to logout");
		}
		throw new Error("Failed to logout");
	}
};

export const getUser = async () => {
	try {
		const response = await api.get("/users");
		console.log("Datos de usuarios:", response.data);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to get users");
		}
		throw new Error("Failed to get users");
	}
};

export const getUserById = async (id: string) => {
	try {
		const response = await api.get(`/users/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to get user");
		}
		throw new Error("Failed to get user");
	}
};

export const deleteUser = async (id: string) => {
	try {
		const response = await api.delete(`/users/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to delete user");
		}
		throw new Error("Failed to delete user");
	}
};

// 5. Función createUser modificada para enviar JSON
export const createUser = async (userData: {
	name: string;
	email: string;
	password?: string;
	phone?: string;
	address?: string;
	role: string;
	profilePicture?: string;
}) => {
        console.log("Datos del usuario:", userData);
		const response = await api.post("/users", userData);
		return console.log(response);
};

export const updateUser = async (id: string, userData: any) => {
    try {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || "Failed to update user");
        }
        throw new Error("Failed to update user");
    }
}


export const getProducts = async () => {
	try {
		const response = await api.get("/products");
		console.log("Datos de productos:", response.data);	
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to get products");
		}
		throw new Error("Failed to get products");
	}
}

export const getProductsById = async (id: string) => {
	try {
		const response = await api.get(`/products/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to get product");
		}
		throw new Error("Failed to get product");
	}
}


export const updateProducts = async (id: string, productData: any) => {
	try {
		const response = await api.put(`/products/${id}`, productData);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to update product");
		}
		throw new Error("Failed to update product");
	}
}
export const deleteProducts = async (id: string) => {
	try{
		const response = await api.delete(`/products/${id}`);
		return response.data;
	}
	catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to delete product");
		}
		throw new Error("Failed to delete product");
	}
}