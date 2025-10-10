import React, { useState, useEffect, useContext } from "react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import SuccessModal from "../SuccessModal";
import { PDFDocument } from "pdf-lib";
import "./SubmitResearch.css";

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
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: "",
    title_description: "",
    abstract: "",
    category: "",
    document: null,
  });
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file && file.type === "application/pdf") {
    setForm({ ...form, document: file });
  } else {
    setForm({ ...form, document: null });
    setError("Only PDF files are allowed.");
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
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
      const res = await axios.post("/projects/submit", formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      setMessage(res.data.message);
      setShowSuccess(true);
      setForm({
        title: "",
        title_description: "",
        abstract: "",
        category: "",
        document: null,
      });
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload project.");
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
        <label>Project Title</label>
        <input type="text" name="title" placeholder="Enter project title" value={form.title} onChange={handleChange} required />

        <label>Project Title Description</label>
        <input type="text" name="title_description" placeholder="Short description" value={form.title_description} onChange={handleChange} required />

        <label>Project Abstract</label>
        <textarea name="abstract" placeholder="Write a short abstract" value={form.abstract} onChange={handleChange} required />

        <label>Project Category</label>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label>Project PDF</label>
        <input type="file" name="document" accept=".pdf" onChange={handleFileChange} required />

        <button type="submit">Upload</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default SubmitResearch;