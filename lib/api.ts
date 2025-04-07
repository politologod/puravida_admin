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
		const response = await api.get(`/user/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to get user");
		}
		throw new Error("Failed to get user");
	}
};

export const updateUser = async (
	id: string,
	name: string,
	address: string,
	phone: string
) => {
	try {
		const response = await api.put(`/user/${id}`, { name, address, phone });
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to update user");
		}
		throw new Error("Failed to update user");
	}
};

export const deleteUser = async (id: string) => {
	try {
		const response = await api.delete(`/user/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to delete user");
		}
		throw new Error("Failed to delete user");
	}
};
