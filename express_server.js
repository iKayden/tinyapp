const express = require("express");
const app = express();
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const PORT = 8080 || 3000; // default port 8080

// Helper functions for routes
const {
  generateRandomId,
  generateRandomString,
  urlsForUser,
  getUserByEmail,
} = require("./helpers/functions");

// middleware and settings for the Express server
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

//our mock-data-bases
const urlDatabase = {
  "b2xVn2": {
    "longURL": "http://www.lighthouselabs.ca",
    "user_id": "",
  },
  "9sm5xK": { "longURL": "http://www.google.com", "user_id": "" },
};
const users = {};

// Routes for the server

// Register routes////////////////////
app.post("/register", (req, res) => {
  const userID = generateRandomId();
  const userEmail = req.body.email;

  // Form validation logic
  if (!userEmail || !req.body.password) {
    return res
      .status(400)
      .send(`<h1>Provide a valid email and/or password, please.</h1>`);
  }
  for (const id in users) {
    if (userEmail === users[id].email) {
      return res
        .status(400)
        .send(
          `<h1>This email "${userEmail}" already exist. Try to Login on it or choose another email.</h1>`
        );
    }
  }
  // "Database" building
  users[userID] = {
    id: userID,
    email: userEmail,
    password: bcrypt.hashSync(req.body.password, 10),
  };

  // output of register post route
  res.cookie("user_id", userID);

  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = { user_id: req.cookies["user_id"] };
  res.render("urls_register", templateVars);
});
//// end of registration route ^//////

// Login routes ////////////////////////////////////////////
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // Login validation logic
  const userID = getUserByEmail(email, users);
  if (bcrypt.compareSync(password, users[userID].password)) {
    res.cookie("user_id", userID);
    return res.redirect("/urls");
  }
  return res
    .status(403)
    .send("Information you've provided is incorrect. Try again.");
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = { user_id: req.cookies["user_id"] };

  res.render("urls_login", templateVars);
});
//End of login routes ///////////////////////////////////////

// Logout route
app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Main/Index page /////////////////////////////////////////
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
  templateVars.urls = urlsForUser(templateVars.user_id, urlDatabase);
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});
/////////////////////////////////////////////////////

// Create New URL link //////////////////////////////
app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"] };
  if (!templateVars.user_id) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = { longURL, user_id: req.cookies["user_id"] };
  console.log("URL DATABASE ===>>>", urlDatabase);
  res.redirect(`/urls/${id}`);
});
//End of Creating new URL link/////////////////////////

// ID Route Handlers//////////////////////////
app.post("/urls/:id/edit", (req, res) => {
  const storedUserID = req.cookies["user_id"];
  const user = users[storedUserID].id;
  const id = req.params.id;
  const accessRights = urlDatabase[id].user_id;
  if (storedUserID && user) {
    if (user === accessRights) {
      urlDatabase[id].longURL = req.body.id;
      return res.redirect("/urls");
    }
  }
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userCheckID = req.cookies["user_id"];
  const currentUser = users[userCheckID].id;
  const shortURL = req.params.shortURL;
  const accessRights = urlDatabase[shortURL].user_id;
  console.log("ACCESS RIGHTS _______________:", accessRights);
  if (userCheckID && currentUser) {
    if (currentUser === accessRights) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    }
  }
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies["user_id"];
  const id = req.params.id;
  const templateVars = {
    user_id,
    id,
    longURL: urlDatabase[id].longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});

// -------- Server Initiation ------------------ //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
