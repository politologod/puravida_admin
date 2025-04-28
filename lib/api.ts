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

// Configuración para peticiones multipart/form-data (subida de archivos)
const apiFormData = axios.create({
	baseURL: "http://localhost:2300/api",
	withCredentials: true,
	headers: {
		"Content-Type": "multipart/form-data",
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

// Aplicar el mismo interceptor al cliente para form-data
apiFormData.interceptors.response.use(
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
		console.log('Intentando iniciar sesión con:', { email, password: '***' });
		
		const response = await api.post("/auth/login", { email, password });
		
		console.log('Respuesta del servidor:', response.status);
		console.log('Datos de respuesta:', response.data);
		console.log('Cookies después del login:', document.cookie);
		
		return response.data;
	} catch (error) {
		console.error('Error completo durante login:', error);
		if (axios.isAxiosError(error) && error.response) {
			console.error('Error de respuesta del servidor:', error.response.data);
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
		const response = await api.post("/auth/register", {
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
		const response = await api.post("/auth/logout");
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
		console.log("Datos de usuarios (respuesta completa):", response);
		
		// Verificar la estructura de datos y asegurar que devolvamos un array
		let usersData = response.data;
		
		// Si la respuesta no es un array, intentar encontrar el array de usuarios
		if (usersData && typeof usersData === 'object' && !Array.isArray(usersData)) {
			if (usersData.data) usersData = usersData.data;
			else if (usersData.users) usersData = usersData.users;
			else if (usersData.items) usersData = usersData.items;
			else if (usersData.results) usersData = usersData.results;
		}
		
		// Asegurar que devolvemos un array
		if (!Array.isArray(usersData)) {
			console.error("La estructura de respuesta no contiene un array de usuarios:", usersData);
			return []; // Devolver array vacío para evitar errores
		}
		
		console.log("Datos de usuarios procesados:", usersData);
		return usersData;
	} catch (error) {
		console.error("Error completo al obtener usuarios:", error);
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

export const getAllProducts = async () => {
	try {
		console.log("API: Iniciando solicitud para obtener todos los productos");
		const response = await api.get("/products");
		console.log("API: Respuesta recibida de productos:", response.status);
		
		// Verificar estructura de datos
		if (response.data && Array.isArray(response.data.data)) {
			console.log(`API: Se encontraron ${response.data.data.length} productos`);
			return response.data;
		} else if (response.data && Array.isArray(response.data.products)) {
			// Estructura específica con products
			console.log(`API: Se encontraron ${response.data.products.length} productos en formato products`);
			return { data: response.data.products };
		} else {
			console.warn("API: La estructura de respuesta de productos no es la esperada:", response.data);
			// Intentar adaptar si la estructura es diferente
			if (Array.isArray(response.data)) {
				console.log("API: Adaptando formato de respuesta (array directo)");
				return { data: response.data };
			}
			return response.data;
		}
	} catch (error) {
		console.error("API: Error completo al obtener productos:", error);
		if (axios.isAxiosError(error) && error.response) {
			console.error("API: Error de respuesta del servidor:", error.response.data);
			throw new Error(error.response.data?.message || "Failed to get products");
		}
		throw new Error("Failed to get products");
	}
}

export const getProductById = async (id: string) => {
	try {
		const response = await api.get(`/products/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to get product");
		}
		throw new Error("Failed to get product");
	}
};

// Alias para mantener compatibilidad con el código existente
export const getProductsById = getProductById;

export const createProduct = async (productData: {
	name: string;
	description?: string;
	category: string;
	price: number;
	stock: number;
	metadata?: object;
	images?: string[];
	imageUrl?: string;
	metaTitle?: string;
	metaDescription?: string;
	seoKeywords?: string;
}) => {
	try {
		console.log("Datos del producto:", productData);
		const response = await api.post("/products", productData);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to create product");
		}
		throw new Error("Failed to create product");
	}
};

export const updateProduct = async (id: string, productData: any) => {
	try {
		console.log("API: Actualizando producto con ID:", id);
		console.log("API: Datos enviados para actualización:", productData);
		
		// Transformar categories a categoryIds si existe
		if (productData.categories && Array.isArray(productData.categories)) {
			// Convertir cualquier objeto a ID simple y asegurar que sean números
			productData.categoryIds = productData.categories.map((cat: any) => 
				typeof cat === 'object' && cat.id ? Number(cat.id) : Number(cat)
			);
			
			// Eliminar el campo categories ya que usaremos categoryIds
			delete productData.categories;
			
			console.log("API: Enviando categoryIds formateados:", productData.categoryIds);
		}
		
		const response = await api.put(`/products/${id}`, productData);
		console.log("API: Respuesta de actualización de producto:", response.status);
		return response.data;
	} catch (error) {
		console.error("API: Error al actualizar producto:", error);
		if (axios.isAxiosError(error) && error.response) {
			console.error("API: Detalles del error:", error.response.data);
			throw new Error(error.response.data?.message || "Failed to update product");
		}
		throw new Error("Failed to update product");
	}
};

// Alias para mantener compatibilidad con el código existente
export const updateProducts = updateProduct;

export const deleteProduct = async (id: string) => {
	try {
		const response = await api.delete(`/products/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Failed to delete product");
		}
		throw new Error("Failed to delete product");
	}
};

// Funciones para manejar órdenes
export const getOrders = async () => {
	try {
		const response = await api.get("/orders");
		console.log("API: Respuesta de órdenes recibida:", response.status);
		
		// Verificar estructura de datos
		let ordersData = response.data;
		
		// Si la respuesta no es un array, intentar encontrar el array de órdenes
		if (ordersData && typeof ordersData === 'object' && !Array.isArray(ordersData)) {
			if (ordersData.data) ordersData = ordersData.data;
			else if (ordersData.orders) ordersData = ordersData.orders;
			else if (ordersData.items) ordersData = ordersData.items;
			else if (ordersData.results) ordersData = ordersData.results;
		}
		
		// Asegurar que devolvemos un array
		if (!Array.isArray(ordersData)) {
			console.error("API: La estructura de respuesta de órdenes no es la esperada:", ordersData);
			return []; // Devolver array vacío para evitar errores
		}
		
		console.log(`API: Se encontraron ${ordersData.length} órdenes`);
		return ordersData;
	} catch (error) {
		console.error("API: Error completo al obtener órdenes:", error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener órdenes");
		}
		throw new Error("Error al obtener órdenes");
	}
};

export const getMyOrders = async () => {
	try {
		const response = await api.get("/orders/my-orders");
		console.log("API: Respuesta de mis órdenes recibida:", response.status);
		
		// Verificar estructura de datos
		let ordersData = response.data;
		
		// Si la respuesta no es un array, intentar encontrar el array de órdenes
		if (ordersData && typeof ordersData === 'object' && !Array.isArray(ordersData)) {
			if (ordersData.data) ordersData = ordersData.data;
			else if (ordersData.orders) ordersData = ordersData.orders;
			else if (ordersData.items) ordersData = ordersData.items;
			else if (ordersData.results) ordersData = ordersData.results;
		}
		
		// Asegurar que devolvemos un array
		if (!Array.isArray(ordersData)) {
			console.error("API: La estructura de respuesta de mis órdenes no es la esperada:", ordersData);
			return []; // Devolver array vacío para evitar errores
		}
		
		console.log(`API: Se encontraron ${ordersData.length} órdenes del usuario`);
		return ordersData;
	} catch (error) {
		console.error("API: Error completo al obtener mis órdenes:", error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener mis órdenes");
		}
		throw new Error("Error al obtener mis órdenes");
	}
};

export const getOrderById = async (id: string) => {
	try {
		const response = await api.get(`/orders/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener la orden");
		}
		throw new Error("Error al obtener la orden");
	}
};

export const createOrder = async (orderData: {
	total: number;
	shippingAddress: string;
	paymentMethod: string;
	items: Array<{
		productId: string | number;
		quantity: number;
		price: number;
		name?: string;
	}>;
	paymentNotes?: string;
}) => {
	try {
		console.log("Datos de la orden:", orderData);
		const response = await api.post("/orders", orderData);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al crear la orden");
		}
		throw new Error("Error al crear la orden");
	}
};

export const processPayment = async (id: string, paymentData: {
	paymentProofUrl?: string;
	paymentMethod: string;
	paymentNotes?: string;
}) => {
	try {
		const response = await api.post(`/orders/${id}/payment`, paymentData);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al procesar el pago");
		}
		throw new Error("Error al procesar el pago");
	}
};

export const updateOrderStatus = async (id: string, status: string) => {
	try {
		const response = await api.put(`/orders/${id}/status`, { status });
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al actualizar el estado de la orden");
		}
		throw new Error("Error al actualizar el estado de la orden");
	}
};

export const updateOrderStatus2 = async (id: string, status: string) => {
	try {
		const response = await api.put(`/orders/${id}/update-status`, { status });
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al actualizar el estado de la orden");
		}
		throw new Error("Error al actualizar el estado de la orden");
	}
};

export const updateOrder = async (id: string, orderData: any) => {
	try {
		const response = await api.put(`/orders/${id}`, orderData);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al actualizar la orden");
		}
		throw new Error("Error al actualizar la orden");
	}
};

export const deleteOrder = async (id: string) => {
	try {
		const response = await api.delete(`/orders/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al eliminar la orden");
		}
		throw new Error("Error al eliminar la orden");
	}
};

// Funciones para manejar imágenes de productos
export const uploadProductImage = async (productId: string | number, imageFile: File) => {
	try {
		const formData = new FormData();
		formData.append('image', imageFile);

		const response = await apiFormData.post(`/uploads/products/${productId}/image`, formData);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al subir imagen del producto");
		}
		throw new Error("Error al subir imagen del producto");
	}
};

export const uploadMultipleProductImages = async (productId: string | number, imageFiles: File[]) => {
	try {
		const formData = new FormData();
		imageFiles.forEach(file => {
			formData.append('images', file);
		});

		const response = await apiFormData.post(`/uploads/products/${productId}/images`, formData);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al subir imágenes del producto");
		}
		throw new Error("Error al subir imágenes del producto");
	}
};

export const deleteProductImage = async (productId: string | number, imageId: string) => {
	try {
		const response = await api.delete(`/uploads/products/${productId}/images/${imageId}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al eliminar imagen del producto");
		}
		throw new Error("Error al eliminar imagen del producto");
	}
};

export const uploadPaymentProof = async (orderId: string | number, imageFile: File) => {
	try {
		const formData = new FormData();
		formData.append('image', imageFile);

		const response = await apiFormData.post(`/uploads/orders/${orderId}/payment-proof`, formData);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al subir comprobante de pago");
		}
		throw new Error("Error al subir comprobante de pago");
	}
};

// Funciones para manejar impuestos
export const getAllTaxes = async () => {
	try {
		console.log("Obteniendo impuestos");
		const response = await api.get("/taxes");
		
		if (response.data && Array.isArray(response.data)) {
			return { data: response.data };
		} else if (response.data && typeof response.data === 'object' && response.data.data) {
			return response.data;
		}
		
		// Para desarrollo, si no hay datos reales
		return {
			data: [
				{
					id: 1,
					name: "IVA",
					code: "VAT",
					description: "Impuesto al Valor Agregado",
					rate: 16,
					is_percentage: true,
					applies_to_all: true,
					country: "Venezuela",
					region: "",
					active: true,
					created_at: "2023-01-01",
					updated_at: "2023-01-01"
				},
				{
					id: 2,
					name: "IGTF",
					code: "IGTF",
					description: "Impuesto a las Grandes Transacciones Financieras",
					rate: 3,
					is_percentage: true,
					applies_to_all: false,
					country: "Venezuela",
					region: "",
					active: true,
					created_at: "2023-01-01",
					updated_at: "2023-01-01"
				}
			]
		};
	} catch (error) {
		console.error("Error al obtener impuestos:", error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener impuestos");
		}
		throw new Error("Error al obtener impuestos");
	}
};

export const getTaxById = async (id: string) => {
	try {
		const response = await api.get(`/taxes/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener el impuesto");
		}
		throw new Error("Error al obtener el impuesto");
	}
};

export const createTax = async (taxData: {
	name: string;
	code: string;
	rate: number;
	description?: string;
	is_percentage?: boolean;
	applies_to_all?: boolean;
	country?: string;
	region?: string;
	active?: boolean;
}) => {
	try {
		console.log("Creando impuesto:", taxData);
		const response = await api.post("/taxes", taxData);
		return response.data;
	} catch (error) {
		console.error("Error al crear impuesto:", error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al crear el impuesto");
		}
		throw new Error("Error al crear el impuesto");
	}
};

export const updateTax = async (id: string, taxData: any) => {
	try {
		console.log("Actualizando impuesto:", id, taxData);
		const response = await api.put(`/taxes/${id}`, taxData);
		return response.data;
	} catch (error) {
		console.error("Error al actualizar impuesto:", error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al actualizar el impuesto");
		}
		throw new Error("Error al actualizar el impuesto");
	}
};

export const deleteTax = async (id: string) => {
	try {
		const response = await api.delete(`/taxes/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al eliminar el impuesto");
		}
		throw new Error("Error al eliminar el impuesto");
	}
};

export const updateProductTax = async (
	productId: string | number, 
	taxId: string | number, 
	data: { is_exempt?: boolean; custom_rate?: number }
) => {
	try {
		console.log(`Actualizando impuesto ${taxId} para producto ${productId}:`, data);
		const response = await api.put(`/taxes/products/${productId}/taxes/${taxId}`, data);
		return response.data;
	} catch (error) {
		console.error("Error al actualizar impuesto del producto:", error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al actualizar impuesto del producto");
		}
		throw new Error("Error al actualizar impuesto del producto");
	}
};

export const getProductTaxes = async (productId: string | number) => {
	try {
		const response = await api.get(`/taxes/products/${productId}/taxes`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener impuestos del producto");
		}
		throw new Error("Error al obtener impuestos del producto");
	}
};

export const applyTaxToMultipleProducts = async (
	taxId: string | number,
	productIds: (string | number)[],
	data: { is_exempt?: boolean; custom_rate?: number }
) => {
	try {
		console.log(`Aplicando impuesto ${taxId} a ${productIds.length} productos con datos:`, data);
		
		const response = await api.put(`/taxes/${taxId}/products/batch`, {
			product_ids: productIds,
			...data
		});
		
		// En modo de desarrollo, simular una respuesta exitosa si no hay backend
		if (!response.data && typeof window !== 'undefined') {
			console.log('Backend no detectado, simulando respuesta exitosa para desarrollo');
			return {
				success: true,
				message: `Impuesto aplicado a ${productIds.length} productos correctamente`,
				affected: productIds.length
			};
		}
		
		return response.data;
	} catch (error) {
		console.error("Error al aplicar impuesto a múltiples productos:", error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al aplicar impuesto a múltiples productos");
		}
		throw new Error("Error al aplicar impuesto a múltiples productos");
	}
};

export const applyTaxToAllProducts = async (
	taxId: string | number,
	data: { is_exempt?: boolean; custom_rate?: number }
) => {
	try {
		const response = await api.put(`/taxes/${taxId}/products`, data);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al aplicar impuesto a todos los productos");
		}
		throw new Error("Error al aplicar impuesto a todos los productos");
	}
};

export const getProductsWithTax = async (taxId: string | number) => {
	try {
		const response = await api.get(`/taxes/${taxId}/products`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener productos con impuesto");
		}
		throw new Error("Error al obtener productos con impuesto");
	}
};

export const calculateTaxesForCart = async (cartItems: Array<{
	product_id: string | number;
	quantity: number;
	price: number;
}>) => {
	try {
		const response = await api.post(`/taxes/calculate`, { items: cartItems });
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al calcular impuestos para el carrito");
		}
		throw new Error("Error al calcular impuestos para el carrito");
	}
};

export const getProductWithTaxes = async (productId: string | number) => {
	try {
		const response = await api.get(`/products/${productId}/taxes`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener producto con impuestos");
		}
		throw new Error("Error al obtener producto con impuestos");
	}
};

export const removeProductTax = async (productId: string | number, taxId: string | number) => {
	try {
		const response = await api.delete(`/taxes/products/${productId}/taxes/${taxId}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al eliminar impuesto del producto");
		}
		throw new Error("Error al eliminar impuesto del producto");
	}
};

// Funciones para manejar estadísticas y métricas del sistema
export const getDashboardStats = async () => {
	try {
		const response = await api.get("/admin/stats/dashboard");
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener estadísticas del dashboard");
		}
		throw new Error("Error al obtener estadísticas del dashboard");
	}
};

export const getGeneralStats = async () => {
	try {
		const response = await api.get("/admin/stats");
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener estadísticas generales");
		}
		throw new Error("Error al obtener estadísticas generales");
	}
};

export const getSalesByCategory = async () => {
	try {
		const response = await api.get("/admin/stats/category");
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener ventas por categoría");
		}
		throw new Error("Error al obtener ventas por categoría");
	}
};

export const getOrdersByMonth = async (year?: number) => {
	try {
		const url = year ? `/admin/stats/orders?year=${year}` : "/admin/stats/orders";
		const response = await api.get(url);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener órdenes por mes");
		}
		throw new Error("Error al obtener órdenes por mes");
	}
};

export const getCustomersByMonth = async (year?: number) => {
	try {
		const url = year ? `/admin/stats/customers?year=${year}` : "/admin/stats/customers";
		const response = await api.get(url);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener clientes por mes");
		}
		throw new Error("Error al obtener clientes por mes");
	}
};

export const getSalesByMonth = async (year?: number) => {
	try {
		const url = year ? `/admin/stats/sales?year=${year}` : "/admin/stats/sales";
		const response = await api.get(url);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener ventas por mes");
		}
		throw new Error("Error al obtener ventas por mes");
	}
};

export const getMaintenanceMode = async () => {
	try {
		const response = await api.get("/admin/maintenance");
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener modo de mantenimiento");
		}
		throw new Error("Error al obtener modo de mantenimiento");
	}
};

export const setMaintenanceMode = async (maintenance: { maintenance_mode: boolean, maintenance_message?: string }) => {
	try {
		const response = await api.post("/admin/maintenance", maintenance);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al actualizar modo de mantenimiento");
		}
		throw new Error("Error al actualizar modo de mantenimiento");
	}
};

export const getSystemHealth = async () => {
	try {
		const response = await api.get("/health");
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener estado del sistema");
		}
		throw new Error("Error al obtener estado del sistema");
	}
};

export const getSystemMetrics = async () => {
	try {
		const response = await api.get("/health/metrics");
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener métricas del sistema");
		}
		throw new Error("Error al obtener métricas del sistema");
	}
};

// Funciones para manejar categorías
export const getAllCategories = async () => {
	try {
		const response = await api.get("/categories");
		console.log("Datos de categorías:", response.data);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener categorías");
		}
		throw new Error("Error al obtener categorías");
	}
};

export const getCategoryById = async (id: string) => {
	try {
		const response = await api.get(`/categories/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al obtener categoría");
		}
		throw new Error("Error al obtener categoría");
	}
};

export const createCategory = async (categoryData: {
	name: string;
	description?: string;
	metaTitle?: string;
	metaDescription?: string;
	seoKeywords?: string;
}) => {
	try {
		const response = await api.post("/categories", categoryData);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al crear categoría");
		}
		throw new Error("Error al crear categoría");
	}
};

export const updateCategory = async (id: string, categoryData: {
	name?: string;
	description?: string;
	metaTitle?: string;
	metaDescription?: string;
	seoKeywords?: string;
}) => {
	try {
		const response = await api.put(`/categories/${id}`, categoryData);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al actualizar categoría");
		}
		throw new Error("Error al actualizar categoría");
	}
};

export const deleteCategory = async (id: string) => {
	try {
		const response = await api.delete(`/categories/${id}`);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data?.message || "Error al eliminar categoría");
		}
		throw new Error("Error al eliminar categoría");
	}
};