const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const PORT = 8080 || 3000; // default port 8080

// function for making random strings. You can choose the length of it as a param (len)
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

// middleware and settings for the Express server
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

//our mock-data-base
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Routes for the server

// Login route
app.post("/login", (req, res) => {
  const userName = req.body.username;
  res.cookie("username", userName);
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Main/Index page
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// new URL creation route
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
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
