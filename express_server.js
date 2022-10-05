const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const PORT = 8080 || 3000; // default port 8080

// functions for routes
function generateRandomString() {
  const randChar =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";
  const urlLength = randChar.length;
  for (let i = 0; i < 6; i++) {
    output += randChar.charAt(Math.floor(Math.random() * urlLength));
  }
  return output;
}
const getUserByEmail = (email) => {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }

  return null;
};
function generateRandomId() {
  return Math.random().toString(36).substring(2, 4);
}
// middleware and settings for the Express server
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

//our mock-data-bases
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Routes for the server

// Register routes////////////////////
app.post("/register", (req, res) => {
  const user = generateRandomId();
  const userEmail = req.body.email;

  // Form validation logic
  if (!userEmail || !req.body.password) {
    return res
      .status(400)
      .send(`<h1>Provide a valid email and/or password, please.</h1>`);
  }
  if (getUserByEmail(userEmail)) {
    return res
      .status(400)
      .send(
        `<h1>This email "${userEmail}" already exist. Try to Login on it or choose another email.</h1>`
      );
  }
  // "Database" building and cookie storing code
  users[user] = {
    id: user,
    email: userEmail,
    password: req.body.password,
  };

  // output of register post route
  res.cookie("user_id", user);
  console.log(users);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"] };
  res.render("urls_register", templateVars);
});
//// end of registration route ^//////

// Login routes ////////////////////////////////////////////
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // Login validation logic
  if (users === {}) {
    return res.redirect("/urls_login");
  }
  for (const user in users) {
    if (email === users[user].email) {
      if (password === users[user].password) {
        res.cookie("user_id", user);
        return res.redirect("/urls");
      }
    }
  }
  return res
    .status(403)
    .send("Information you've provided is incorrect. Try again.");
});

app.get("/login", (req, res) => {
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
  const templateVars = { urls: urlDatabase };
  templateVars.user_id = req.cookies["user_id"];
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});
/////////////////////////////////////////////////////

// Create New URL page //////////////////////////////
app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

// new URL creation route
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//////////////////////////////////////////////
// id Handlers////////////////////////////////
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.cookies["user_id"],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.id;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  console.log("edit path attempt: ", urlDatabase);
  res.redirect(`/urls/${id}`);
});

// -------- Server Initiation ------------------ //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
