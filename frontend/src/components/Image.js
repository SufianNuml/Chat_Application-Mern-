import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/ImageUpload.css"; // Ensure this path is correct
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

export default function ImageUpload() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [username, setUsername] = useState(""); // State to store the username
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileImage = async () => {
      const loggedInUser = localStorage.getItem("username");
      if (loggedInUser) {
        setUsername(loggedInUser);

        try {
          const response = await axios.get(`http://localhost:5000/api/profile-image/${loggedInUser}`);
          if (response.data.imageUrl) {
            setPreview(`http://localhost:5000/${response.data.imageUrl}?t=${new Date().getTime()}`);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("This user was not uploaded pic yet");
          } else {
            console.error("Error fetching image:", error);
          }
        }
      }
    };

    fetchProfileImage();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Preview the selected image
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      alert("Please select an image to upload");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("username", username); // Append the username to the form data

    try {
      await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Image uploaded successfully");
      setImage(null);

      // Fetch the updated image after upload
      const response = await axios.get(`http://localhost:5000/api/profile-image/${username}`);
      if (response.data.imageUrl) {
        setPreview(`http://localhost:5000/${response.data.imageUrl}?t=${new Date().getTime()}`);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    }
  };

  const handleImageDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/delete-profile/${username}`);
      alert("Image and user deleted successfully");
      setPreview(null); // Clear the preview
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image");
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("username"); // Clear the username from local storage
      navigate("/login"); // Navigate to the login page
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmDelete) {
      const username = localStorage.getItem("username");
      
      try {
        // Send a request to delete the account and associated data
        await axios.delete(`http://localhost:5000/api/delete-account/${username}`);

        // Clear local storage
        localStorage.removeItem("username");

        // Navigate to the login page
        navigate("/login");
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  return (
    <div className="image-upload-container">
      <div>
        <h1 style={{color:"white",backgroundColor:"#85a0a1"}}>{username}</h1>
        <br />
      </div>
      <div
        className="image-preview"
        style={{ backgroundImage: `url(${preview || ""})` }}
      >
        {!preview && (
          <div className="placeholder">
            <FaPlus className="plus-icon" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          Choose Profile
        </label>
      </div>
      <button onClick={handleImageUpload} className="upload-button">
        Upload Image
      </button>
      <button onClick={handleImageDelete} className="upload-button">
        Delete Image
      </button>
      <button onClick={handleLogout} className="upload-button">
        Log Out
      </button>
      <button onClick={handleDeleteAccount} className="upload-button">
        Delete Account
      </button>
    </div>
  );
}
