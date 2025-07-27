import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import "./SubmitResearch.css";

function SuccessModal({ show, onClose, message }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{
        background: "#fff",
        padding: "2rem 2.5rem",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        textAlign: "center",
        minWidth: "320px"
      }}>
        <h2 style={{ color: "#34d399", marginBottom: "1rem" }}>Success!</h2>
        <div style={{ marginBottom: "1.5rem" }}>{message}</div>
        <button
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.7rem 2rem",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: "pointer"
          }}
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

const SubmitResearch = () => {
  const [form, setForm] = useState({
    title: "",
    abstract: "",
    authors: "",
    category: "",
    document: null,
  });
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch categories from backend
    axios.get("/research/categories")
      .then(res => setCategories(res.data.categories))
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, document: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!form.title || !form.abstract || !form.authors || !form.category || !form.document) {
      setError("All fields and a PDF document are required.");
      return;
    }
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('abstract', form.abstract);
    formData.append('authors', form.authors);
    formData.append('category', form.category);
    formData.append('document', form.document);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post("/research/submit", formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      setMessage(res.data.message);
      setShowSuccess(true); // Show the modal
      setForm({ title: "", abstract: "", authors: "", category: "", document: null });
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload research paper.");
    }
  };

  return (
    <div className="submit-research-container">
      <SuccessModal
      show={showSuccess}
      onClose={() => setShowSuccess(false)}
      message={
        <>
          <div>Your research project was uploaded successfully and is now <b>pending admin review</b>.</div>
          <div style={{ marginTop: 10 }}>
            You'll get notified once its been approved and see your project in the repository.
          </div>
        </>
      }
    />
      <h2>Upload Final Research Paper</h2>
      <form className="research-form" onSubmit={handleSubmit}>
        <label>Title</label>
        <input type="text" name="title" placeholder="Enter research title" value={form.title} onChange={handleChange} required />
        <label>Abstract</label>
        <textarea name="abstract" placeholder="Write a short abstract" value={form.abstract} onChange={handleChange} required />
        <label>Authors</label>
        <input type="text" name="authors" placeholder="Enter full name(s) of authors" value={form.authors} onChange={handleChange} required />
        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <label>Upload PDF</label>
        <input type="file" name="document" accept=".pdf" onChange={handleFileChange} required />
        <button type="submit">Upload</button>
      </form>
      {/* {message && <p className="success-message">{message}</p>} */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default SubmitResearch;