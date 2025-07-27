// src/api/research.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api/research'; // Base URL for research API

// Function to submit a new research proposal
export const submitResearchProposal = async (formData, token) => {
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

// You can add more functions here for other research-related API calls:
// export const getResearchProposals = async (token) => {
//   try {
//     const response = await axios.get(`${API_URL}/`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };