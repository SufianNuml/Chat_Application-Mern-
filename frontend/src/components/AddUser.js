import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/AddUser.css";
import Navbar from "./Navbar";

const AddUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [noMatch, setNoMatch] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      axios
        .get(`http://localhost:5000/api/searchUsers?username=${searchTerm}`)
        .then((response) => {
          console.log("API response:", response.data);
          if (response.data.length > 0) {
            setUsers(response.data);
            setNoMatch(false); // Reset noMatch since we found users
          } else {
            setUsers([]);
            setNoMatch(true); // No users found, show the noMatch message
          }
        })
        .catch((error) => {
          console.error("Error fetching users:", error);
          setUsers([]);
          setNoMatch(true); // In case of an error, show noMatch message
        });
    } else {
      setUsers([]);
      setNoMatch(false); // Reset noMatch when input is cleared
    }
  }, [searchTerm]);

  // logined user id fetch

  const fetchUserIdByUsername = async () => {

    const username = localStorage.getItem("username");
    if (!username) {
      console.error("Username is not found in local storage");
      return null;
    }

    try {
      const response = await axios.get(
        "http://localhost:5000/api/getUserIdByUsername",
        {
          params: { username },
        }
      );
      return response.data.userId; // Return the user ID
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  // ----------------------------

  const addFriend = async (friendId) => {
    try {
      const loggedInUserId = await fetchUserIdByUsername();
      if (!loggedInUserId) {
        throw new Error("Could not retrieve logged-in user ID");
      }
      await axios.post("http://localhost:5000/api/addFriend", {
        userId: loggedInUserId,
        friendId,
      });
      // Optionally, update the UI to show the friend was added
      alert("Friend added successfully");
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  return (
    <div className="add-user-container">
      <Navbar />
      <br />
      <h1 style={{color:"white",backgroundColor:"#85a0a1"}}>Add Friend</h1>
      <br />
      <input
        type="text"
        placeholder="Type a username of friend"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {noMatch ? (
        <h1 className="no-match-message">
          Please insert a valid username in the input field
        </h1>
      ) : (
        <table className="user-table">
          <tbody>
            {users.map((user) => {
              // Check if the profilePic already contains 'uploads/' and avoid duplicating the path
              const imageUrl = user.image?.startsWith("uploads/")
                ? `http://localhost:5000/${user.image}`
                : `http://localhost:5000/uploads/${user.image}`;

              return (
                <tr key={user._id} className="user-row">
                  <td>
                    <img
                      src={imageUrl}
                      alt="Profile"
                      className="profile-pic"
                      onError={(e) => {
                        e.target.src = "/defaultImage.png"; // Ensure this path exists in your project
                      }}
                    />
                  </td>
                  <td>{user.username}</td>
                  <td>
                    <button
                      className="add-friend-btn"
                      onClick={() => addFriend(user._id)}
                    >
                      Add Friend
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AddUser;
