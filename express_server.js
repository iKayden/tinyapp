const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// function for making random strings. You can choose the length of it as a param (len)
function generateRandomString(len) {
  const randChar =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let output = "";
  const urlLength = randChar.length;
  for (let i = 0; i < len; i++) {
    output += randChar.charAt(Math.floor(Math.random() * urlLength));
  }
  console.log(output);
  return output;
}

// settings for the Express server
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//our mock-data-base
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Routes for the server

// app.get routes
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World!</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.post routes
app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

// -------- Server Initiation ------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
