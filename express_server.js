const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// settings for the Express server
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//our mock-data-base
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Routes for the server

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

// -------- Server Initiation ------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
