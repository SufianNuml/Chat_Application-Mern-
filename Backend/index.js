const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

// Import database models

require("./db/config");
const test = require("./db/user"); // Import the User model
const Image = require("./db/ProfileImage");
const message = require("./db/Message");


// Initialize Express app
const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"],
    credentials: true,               // Allow credentials (cookies, headers, etc.)
  },
});
const PORT = 5000;

// Middleware
app.use(express.json());

app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));








const fs = require("fs");
const bcrypt = require("bcryptjs"); // Import bcrypt once
const crypto = require("crypto");
var nodemailer = require("nodemailer");
const router = express.Router();




app.use("/uploads", express.static("public/uploads"));

// -------------------


// const socketIo = require("socket.io");

// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:3000", // Adjust this to match your frontend URL
//     methods: ["GET", "POST"]
//   }
// });

// Socket.IO connection handler
// io.on("connection", (socket) => {
//   console.log("New client connected");

//   socket.on("message", (msg) => {
//     console.log("Message received:", msg);
//     io.emit("message", msg);
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

// Create uploads directory if it doesn't exist
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// User Registration
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the user with the hashed password
    const newUser = new test({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send("Server error");
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find the user by email
    const user = await test.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Password matched, login successful
    res.json({ message: "Login successful", username: user.username });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Server error");
  }
});

// Fetch Profile-Image by Username
app.get("/api/profile-image/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const userImage = await Image.findOne({ username });

    if (!userImage || !userImage.image) {
      return res.status(404).send("No image found for this username");
    }

    // Send relative path
    res.status(200).json({ imageUrl: userImage.image });
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Error fetching image");
  }
});

// Upload Profile-Image with Username
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    const { username } = req.body; // Expecting username in the request body

    if (!req.file || !username) {
      return res.status(400).send("No file uploaded or username missing");
    }

    // Check if the user already has an image
    let existingImage = await Image.findOne({ username });

    if (existingImage) {
      // Delete the existing image file from the server
      if (fs.existsSync(existingImage.image)) {
        fs.unlinkSync(existingImage.image);
      }

      // Update the image path in the database with the relative path
      existingImage.image = `uploads/${req.file.filename}`;
      await existingImage.save();
    } else {
      // If no image exists, create a new record with the relative path
      const newImage = new Image({
        username: username,
        image: `uploads/${req.file.filename}`,
      });
      await newImage.save();
    }

    res.status(201).send("Image uploaded successfully");
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).send("Error uploading image");
  }
});

// Delete Profile-picture from Database
app.delete("/api/delete-profile/:username", async (req, res) => {
  try {
    const { username } = req.params;
    console.log("Username received:", username); // Log the username

    // Find the user record
    const userImage = await Image.findOne({ username });
    if (!userImage) {
      return res.status(404).send("No user or image found for this username");
    }

    // Delete the image file from the server
    if (fs.existsSync(userImage.image)) {
      fs.unlinkSync(userImage.image);
    }

    // Delete the user record from the database
    await Image.deleteOne({ username });

    res.status(200).send("Image and user deleted successfully");
  } catch (error) {
    console.error("Error deleting image and user:", error);
    res.status(500).send("Error deleting image and user");
  }
});

// Delete Account with Username
app.delete("/api/delete-account/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Delete the image record
    const userImage = await Image.findOne({ username });
    if (userImage) {
      // Delete the image file from the server
      if (fs.existsSync(userImage.image)) {
        fs.unlinkSync(userImage.image);
      }

      // Remove the image record from the database
      await Image.deleteOne({ username });
    }

    // Delete the user record from the `test` collection (User schema)
    const user = await test.findOne({ username });
    if (user) {
      await test.deleteOne({ username });
    }

    res.status(200).send("Account and associated data deleted successfully");
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).send("Error deleting account");
  }
});

//Forgot password api
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await test.findOne({ email });
    if (!user) {
      return res.status(400).send("User with this email does not exist.");
    }

    // Generate a reset token
    const token = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

    // Save the token and expiration in the user's record
    user.resetPasswordToken = token;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sufianaslam127@gmail.com",
        pass: "cuareuwdqhozaavi",
      },
      tls: {
        rejectUnauthorized: true,
      },
      port: 465,
      secure: true,
    });

    const mailOptions = {
      from: "sufianaslam127@gmail.com",
      to: user.email,

      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   http://localhost:3000/ResetPassword?token=${token}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);

    res.status(200).send("Reset link sent.");
  } catch (error) {
    console.error("Error during forgot password:", error);
    res.status(500).send("Error during forgot password: " + error.message);
  }
});

// -------------------------------------api to get new password and modify in database with valid check of token
app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  console.log("Received token:", token);
  console.log("Received new password:", newPassword);

  try {
    // Find the user by the reset token and ensure the token has not expired
    const user = await test.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Invalid or expired token.");
      return res.status(400).send("Invalid or expired token.");
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log("Hashed password:", hashedPassword);

    // Update the user's password in the database
    user.password = hashedPassword;

    // Clear the reset token and expiration from the user's record
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    console.log("Password has been updated successfully.");
    res.status(200).send("Password has been updated successfully.");
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).send("Error during password reset: " + error.message);
  }
});

// ---------------------------------------------
// API for searcha a username for ADD friend

// Fetch Profile Image by Username
// app.get("/api/searchUsers", async (req, res) => {
//   try {
//     // Log incoming request for debugging
//     console.log("Received request for searchUsers with query:", req.query);

//     const { username } = req.query;
//     if (!username) {
//       console.error("No username provided in query");
//       return res.status(400).send("Username query parameter is required");
//     }

//     // Find users matching the search term
//     const users = await Image.find({
//       username: { $regex: username, $options: 'i' }
//     }).select('username image');

//     // Log the result for debugging
//     console.log("Found users:", users);

//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).send("Server error");
//   }
// });

// Search Users and Merge Data from test and Image Collections
app.get("/api/searchUsers", async (req, res) => {
  try {
    console.log("Received request for searchUsers with query:", req.query);
    const { username } = req.query;
    if (!username) {
      console.error("No username provided in query");
      return res.status(400).send("Username query parameter is required");
    }

    // Find users in the test collection
    const users = await test
      .find({
        username: { $regex: username, $options: "i" },
      })
      .select("username email");

    if (users.length === 0) {
      return res.status(404).send("No users found");
    }

    // For each user, find the corresponding image
    const userResults = await Promise.all(
      users.map(async (user) => {
        const profileImage = await Image.findOne({
          username: user.username,
        }).select("image");
        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          image: profileImage ? profileImage.image : null,
        };
      })
    );

    res.status(200).json(userResults);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server error");
  }
});

// Endpoint to upload profile image
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    const { username } = req.body;
    console.log("Received request to upload image for username:", username);

    if (!req.file || !username) {
      console.error("No file uploaded or username missing");
      return res.status(400).send("No file uploaded or username missing");
    }

    let existingImage = await Image.findOne({ username });
    console.log("Existing image record:", existingImage);

    if (existingImage) {
      // Delete existing image file
      if (fs.existsSync(existingImage.image)) {
        fs.unlinkSync(existingImage.image);
        console.log("Deleted old image file:", existingImage.image);
      }

      // Update the image path
      existingImage.image = `uploads/${req.file.filename}`;
      await existingImage.save();
      console.log("Updated image path for user:", username);
    } else {
      // Create a new image record
      const newImage = new Image({
        username: username,
        image: `uploads/${req.file.filename}`,
      });
      await newImage.save();
      console.log("Created new image record for user:", username);
    }

    res.status(201).send("Image uploaded successfully");
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).send("Error uploading image");
  }
});

// --------------------------- Api for addfriend (in adduser component button)
// Add Friend API
app.post("/api/addFriend", async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).send("Both userId and friendId are required");
    }

    if (userId === friendId) {
      return res.status(400).send("Cannot add yourself as a friend");
    }

    // Find the user who is adding the friend
    const user = await test.findById(userId);
    const friend = await test.findById(friendId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!friend) {
      return res.status(404).send("Friend not found");
    }

    // Check if the friend is already in the user's friends list
    if (user.friends.includes(friendId)) {
      return res.status(400).send("Friend already added");
    }

    // Add the friend to the user's friend list and vice versa
    user.friends.push(friendId);
    friend.friends.push(userId);

    await user.save();
    await friend.save();

    res.status(200).send("Friend added successfully");
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).send("Server error");
  }
});

// ---------------------------------get logined person  user_id-----
app.get("/api/getUserIdByUsername", async (req, res) => {
  try {
    const { username } = req.query; // Get username from query parameters
    if (!username) {
      return res.status(400).send("Username query parameter is required");
    }

    // Find user by username in the test collection
    const user = await test.findOne({ username }).select("_id");
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Return the user ID
    res.status(200).json({ userId: user._id });
  } catch (error) {
    console.error("Error fetching user ID:", error);
    res.status(500).send("Server error");
  }
});



// Home page --------------api for fetch friend from test collection array
// -----------------------

app.get('/api/friends', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).send('User ID is required');
    }

    const user = await test.findById(userId).populate('friends', 'username _id');

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).json(user.friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).send('Server error');
  }
});
//1. Save New Messages to the Database


app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).send('Sender, receiver, and content are required');
    }

    const newMessage = new message({
      sender: senderId,
      receiver: receiverId,
      content,
      timestamp: Date.now(),
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).send('Server error');
  }
});


//2. Fetch Message History Between the User and Selected Friend

app.get('/api/messages', async (req, res) => {
  try {
    const { userId, friendId } = req.query;

    if (!userId || !friendId) {
      return res.status(400).send('Both userId and friendId are required');
    }

    const messages = await message.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId }
      ]
    }).sort({ timestamp: 1 });  // Sort messages by timestamp

    if (messages.length === 0) {
      return res.status(200).send("No messages found. Start a conversation!");
    }

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Server error');
  }
});


//3. WebSocket for Real-Time Communication
 // Ensure the correct path to your Message model
// Handle WebSocket connection
io.on('connection', (socket) => {
  console.log('New WebSocket connection:', socket.id);

  // User joins a room based on their userId
  socket.on('joinRoom', (userId) => {
    console.log(`User ${userId} joined room ${userId}`);
    socket.join(userId);  // All tabs with the same userId will join this room
  });

  // Listen for incoming messages
  socket.on('message', async (data) => {
    const { to, content, from } = data;

    try {
      // Save message to the database
      const newMessage = new message({
        sender: from,
        receiver: to,
        content,
        timestamp: Date.now(),
      });

      const savedMessage = await newMessage.save();

      // Emit the message to both sender and receiver rooms, including the sender's other tabs
      console.log('Emitting newMessage to:', to, 'and', from, 'with message:', savedMessage);
      io.to(to).emit('newMessage', savedMessage);   // Emit to receiver
      io.to(from).emit('newMessage', savedMessage); // Emit to sender
    } catch (error) {
      console.error('Error during message handling:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});