import React, { useState } from "react";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import SuccessModal from "../SuccessModal";
import "./SubmitResearch.css";
// NOTE: PDFDocument is imported but unused; I've removed it in the final file.

const categories = [
  "Information Technology",
  "Computer Science",
  "Education",
  "Business Administration",
  "Accountancy",
  "Hospitality and Tourism",
  "Engineering",
  "Health Sciences",
  "Social Sciences",
  "Psychology",
  "Communication and Media Studies",
  "Others"
];

const SubmitResearch = () => {
  const [form, setForm] = useState({
    title: "",
    title_description: "",
    abstract: "",
    category: "",
    document: null,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing/changing a field
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setError("File is too large. Maximum allowed size is 10 MB.");
      e.target.value = null;
      setForm({ ...form, document: null });
      return;
  }

  if (file.type !== "application/pdf") {
    setError("Only PDF files are allowed.");
    e.target.value = null;
    setForm({ ...form, document: null });
    return;
  }

  setForm({ ...form, document: file });
  if (error) setError('');
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.title || !form.title_description || !form.abstract || !form.category || !form.document) {
      setError("All fields and a PDF document are required.");
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('title_description', form.title_description);
    formData.append('abstract', form.abstract);
    formData.append('category', form.category);
    formData.append('document', form.document);

    try {
      const token = localStorage.getItem('token');
      // The API endpoint for submission might require the user's ID/submitter info, 
      // which is usually handled by the server using the JWT token or explicitly sent here.
      // Assuming the backend handles submitter association via the token.
      await axios.post(API_ROUTES.projects.submit, formData, {
        headers: { 
            'Content-Type': 'multipart/form-data', 
            'Authorization': `Bearer ${token}` 
        }
      });

      setShowSuccess(true);
      
      // Reset form fields
      setForm({
        title: "",
        title_description: "",
        abstract: "",
        category: "",
        document: null,
      });
      e.target.reset(); // Also clear file input
    } catch (err) {
      console.error("Submission error:", err.response?.data, err);

      let errMsg = "Failed to submit project. Please try again.";

      if (err.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.message || "";
        const backendError = err.response.data?.error || "";

        // Multer file too large (either from limit or Cloudinary)
        if (
          status === 500 &&
          (backendError.includes("File too large") ||
          backendMsg.includes("File too large") ||
          backendError.includes("LIMIT_FILE_SIZE") ||
          backendMsg.toLowerCase().includes("multer"))
        ) {
          errMsg = "The file is too large. Please upload a PDF smaller than 10 MB (Cloudinary limit). Compress it using smallpdf.com or ilovepdf.com.";
        }
        // Payload too large (413) from server/proxy
        else if (status === 413) {
          errMsg = "File exceeds server limit. Please upload a PDF smaller than 10 MB.";
        }
        // Timeout or network error
        else if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
          errMsg = "Upload is taking too long. Try a smaller file (<10 MB) or check your internet connection.";
        }
        // Bad request (missing fields, wrong type)
        else if (status === 400) {
          if (backendMsg.includes("PDF") || backendMsg.includes("file type") || backendMsg.includes("Only PDF")) {
            errMsg = "Only PDF files are allowed. Please select a valid .pdf document.";
          } else {
            errMsg = backendMsg || "Please check all required fields and try again.";
          }
        }
        // Server internal error (fallback)
        else if (status === 500) {
          errMsg = "Something went wrong on our server. Please try again in a moment or contact support.";
        }
      } else if (!err.response) {
        // Network error / no response
        errMsg = "Cannot connect to server. Check your internet or try again later.";
      }

      setError(errMsg);

      // Clear file input on error
      const fileInput = document.querySelector('input[name="document"]');
      if (fileInput) fileInput.value = null;
      setForm({ ...form, document: null });
    }
  };

  return (
    <div className="submit-research-container">
      <SuccessModal
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={
          "Project submitted successfully!\nWait for the admins approval"
        }
      />
      <h2>Upload Project</h2>
      <form className="research-form" onSubmit={handleSubmit}>
        <label htmlFor="title">Project Title</label>
        <input 
            id="title" 
            type="text" 
            name="title" 
            placeholder="Enter project title" 
            value={form.title} 
            onChange={handleChange} 
            required 
        />

        <label htmlFor="title_description">Project Title Description</label>
        <input 
            id="title_description" 
            type="text" 
            name="title_description" 
            placeholder="Short description" 
            value={form.title_description} 
            onChange={handleChange} 
            required 
        />

        <label htmlFor="abstract">Project Abstract</label>
        <textarea 
            id="abstract" 
            name="abstract" 
            placeholder="Write a short abstract" 
            value={form.abstract} 
            onChange={handleChange} 
            required 
        />

        <label htmlFor="category">Project Category</label>
        <select 
            id="category" 
            name="category" 
            value={form.category} 
            onChange={handleChange} 
            required
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label htmlFor="document">Project PDF</label>
        <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
          Max file size: 10 MB • PDF format only
        </small>
        <input 
            id="document" 
            type="file" 
            name="document" 
            accept=".pdf" 
            onChange={handleFileChange} 
            required 
        />

        <button type="submit">Upload</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default SubmitResearch;