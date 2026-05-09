import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api/project'; // Base URL for research API

// Function to submit a new project
export const submitProject = async (formData, token) => {
  try {
    const response = await axios.post(`${API_URL}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    // Re-throw to be caught by the component
    throw error;
  }
};