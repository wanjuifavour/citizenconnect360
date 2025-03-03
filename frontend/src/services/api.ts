import axios from "axios"
import Cookies from "js-cookie"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085/api"

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove("token")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
)

export const login = async (email: string, password: string) => {
    const response = await api.post("/users/login", { email, password })
    return response.data
}

export const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/users/register", { name, email, password })
    return response.data
}

export const validateToken = async () => {
    const response = await api.get("/users/me")
    return response.data
}

export const reportIncident = async (formData: FormData) => {
    const response = await api.post('/incidents/report', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getAllIncidents = async () => {
    const response = await api.get('/incidents/getAll');
    return response.data;
};

export default api