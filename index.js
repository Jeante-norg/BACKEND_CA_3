const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());

const port = 3001;

const SECRET_KEY = "goodbyeworld";
var users = [
  { username: "user", password: "user123", role: "user" },
  { username: "admin", password: "admin123", role: "admin" },
];

app.post("/login", (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = users.find((u) => {
      return (
        u.username === username && u.password === password && u.role === role
      );
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    var token = jwt.sign(
      { username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "15m" }
    );
    console.log(token);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 1000 * 15,
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log({ message: error.message });
  }
});

app.get("/profile", (req, res) => {
  var token = req.cookies.auth_token;
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    return res
      .status(200)
      .json({ message: "Welcome to your profile!", user: verified.username });
  } catch (error) {
    return res.status(401).json({ message: "unauthorized" });
  }
});

app.get("/admin-login", (req, res) => {
  var token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    if (verified.role !== "admin") {
      return res.status(401).json({ error: "forbidden" });
    }
    return res.status(200).json({ message: "Welcome to the admin dashboard!" });
  } catch (error) {
    return res.status(401).json({ message: "unauthorized" });
  }
});
app.listen(port, () => {
  console.log("server running on http://localhost:3001");
});
