import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import io from "socket.io-client";
import "./css/Homepage.css";

// Define the notification sound path
const notificationSound = new Audio("/tone.mp3");

const Home = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState("");
  const [noMessagesPrompt, setNoMessagesPrompt] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isUserInteracted, setIsUserInteracted] = useState(false);

  const socketRef = useRef(null);

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
      return response.data.userId;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  const updateUnreadCount = (friendId) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [friendId]: (prev[friendId] || 0) + 1,
    }));
  };

  const resetUnreadCount = (friendId) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [friendId]: 0,
    }));
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      setIsUserInteracted(true);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    const initializeSocketAndFetchData = async () => {
      try {
        const userId = await fetchUserIdByUsername();
        setLoggedInUserId(userId);
        console.log("User ID fetched:", userId);

        if (!socketRef.current) {
          socketRef.current = io("http://localhost:5000");
        }
        const socket = socketRef.current;

        socket.emit("joinRoom", userId);

        socket.off("newMessage");

        socket.on("newMessage", (msg) => {
          const friendId =
            msg.sender === loggedInUserId ? msg.receiver : msg.sender;

          if (
            selectedFriend &&
            (msg.receiver === selectedFriend._id ||
              msg.sender === selectedFriend._id)
          ) {
            setMessages((prevMessages) => ({
              ...prevMessages,
              [selectedFriend._id]: [
                ...(prevMessages[selectedFriend._id] || []),
                msg,
              ],
            }));
          } else {
            setMessages((prevMessages) => ({
              ...prevMessages,
              [friendId]: [...(prevMessages[friendId] || []), msg],
            }));

            if (isUserInteracted) {
              notificationSound.play().catch((error) => {
                console.error("Error playing notification sound:", error);
              });
            }

            updateUnreadCount(friendId);
          }
        });

        const fetchFriends = async () => {
          try {
            const response = await axios.get(
              "http://localhost:5000/api/friends",
              {
                params: { userId },
              }
            );
            setFriends(response.data);
          } catch (error) {
            console.error("Error fetching friends:", error);
          }
        };

        fetchFriends();
      } catch (error) {
        console.error("Error initializing socket and fetching data:", error);
      }
    };

    initializeSocketAndFetchData();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("newMessage");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [selectedFriend, loggedInUserId, isUserInteracted]);

  const handleFriendClick = async (friend) => {
    setSelectedFriend(friend);
    resetUnreadCount(friend._id);
    const userId = await fetchUserIdByUsername();

    const response = await axios.get("http://localhost:5000/api/messages", {
      params: {
        userId,
        friendId: friend._id,
      },
    });

    if (response.data === "No messages found. Start a conversation!") {
      setMessages({});
      setNoMessagesPrompt("No messages found. Start a conversation!");
    } else {
      setMessages((prevMessages) => ({
        ...prevMessages,
        [friend._id]: response.data,
      }));
      setNoMessagesPrompt("");
    }
  };

  const sendMessage = async () => {
    if (message.trim() && selectedFriend) {
      const newMessage = {
        to: selectedFriend._id,
        content: message,
        from: loggedInUserId,
      };

      if (socketRef.current) {
        socketRef.current.emit("message", newMessage);
      }

      setMessage("");
    }
  };

  const filteredMessages = messages[selectedFriend?._id] || [];

  return (
    <div className="home-container">
      <Navbar />
      <div className="chat-layout">
        <div className="friend-list">
          <h2>Friends</h2>
          <ul>
            {friends.map((friend) => (
              <li
                key={friend._id}
                className={unreadCounts[friend._id] > 0 ? "highlighted" : ""}
                onClick={() => handleFriendClick(friend)}
              >
                {friend.username}
                {unreadCounts[friend._id] > 0 && (
                  <span className="unread-count">
                    ({unreadCounts[friend._id]})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-box">
          {selectedFriend ? (
            <>
              <h2 >Chat with {selectedFriend.username}</h2>
              <div className="messages">
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={
                        msg.sender === selectedFriend._id
                          ? "message received"
                          : "message sent"
                      }
                    >
                      {msg.content}
                    </div>
                  ))
                ) : (
                  <p>{noMessagesPrompt}</p>
                )}
              </div>

              <div className="chat-input-container">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message"
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <h2>Select a friend to start chatting</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
