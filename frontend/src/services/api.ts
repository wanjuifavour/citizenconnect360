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
  try {
    const files = formData.getAll('media');
    const response = await api.post('/incidents/report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 413 ||
        (error.response.data && error.response.data.message === 'File too large')) {
        throw new Error('One or more files exceed the 30MB size limit');
      }
    }
    throw error;
  }
};

export const getAllIncidents = async () => {
  try {
    const response = await api.get('/incidents/getAll')
    return response.data;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
};

export const getPolls = async () => {
  const response = await api.get('/polls/getAll');
  return response.data;
};

export const getPollById = async (id: number) => {
  const response = await api.get(`/polls/getOne/${id}`);
  return response.data;
};

export const createPoll = async (pollData: {
  title: string;
  description: string;
  category: string;
  options: string[];
  createdBy: number;
  deadline?: string | null;
  allowMultipleSelections?: boolean;
}) => {
  const response = await api.post('/polls/create', pollData);
  return response.data;
};

export const voteOnPoll = async (pollId: number, voteData: { userId: number; optionIndex: number }) => {
  const response = await api.post(`/polls/vote/${pollId}`, voteData);
  return response.data;
};

export const getUserVotes = async (pollId: number, userId: number) => {
  const response = await api.get(`/polls/userVote/${pollId}/${userId}`);
  return response.data;
};

export const getPollStatistics = async (pollId: number) => {
  const response = await api.get(`/polls/statistics/${pollId}`);
  return response.data;
};

// Poll Management
export const updatePoll = async (pollId: number, pollData: {
  title: string;
  description: string;
  category: string;
  options: string[];
  deadline?: string | null;
  allowMultipleSelections?: boolean;
}) => {
  const response = await api.put(`/polls/update/${pollId}`, pollData);
  return response.data;
}

export const deletePoll = async (pollId: number) => {
  const response = await api.delete(`/polls/delete/${pollId}`);
  return response.data;
}

// User Management
export const getAllUsers = async () => {
  const response = await api.get('/users/getAll');
  return response.data;
};

export const updateUserRole = async (userId: number, role: string) => {
  const response = await api.put(`/users/${userId}/role`, { role });
  return response.data;
};

export const deleteUser = async (userId: number) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Incident Management
export const verifyIncident = async (incidentId: number) => {
  const response = await api.put(`/incidents/verify/${incidentId}`, { status: 'Verified' });
  return response.data;
};

export const deleteIncident = async (incidentId: number) => {
  const response = await api.delete(`/incidents/${incidentId}`);
  return response.data;
};

export const updateIncident = async (incidentId: number, data: {
  title: string;
  description: string;
  category: string;
}) => {
  const response = await api.put(`/incidents/update/${incidentId}`, data);
  return response.data;
};

export default api