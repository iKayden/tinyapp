const express = require("express");
const app = express();
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const PORT = 8080 || 3000; // default port 8080

// ++++++ Helper functions for routes ++++++
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
app.use(
  cookieSession({
    name: "session",
    keys: ["keyA", "keyB"],
    maxAge: 24 * 60 * 60 * 1000, // storing cookies for 24 hours
  })
);

//-------mock-data-bases-----//
const urlDatabase = {
  "b2xVn2": {
    "longURL": "http://www.lighthouselabs.ca",
    "user_id": "",
  },
  "9sm5xK": { "longURL": "http://www.google.com", "user_id": "" },
};
const users = {};

// @@@@@   Routes for the server   @@@@@ //

// -----Register routes----Post Register--------------//
app.post("/register", (req, res) => {
  const userID = generateRandomId();
  const userEmail = req.body.email;

  // ### Form validation logic
  if (!userEmail || !req.body.password) {
    return res
      .status(400)
      .send(`<h1>Provide a valid email and/or password, please.</h1>`);
  }
  if (getUserByEmail(userEmail, users)) {
    return res
      .status(400)
      .send(
        `<h1>This email "${userEmail}" already exist. Try to Login on it or choose another email.</h1>`
      );
  }

  // ### "Database" building
  users[userID] = {
    id: userID,
    email: userEmail,
    password: bcrypt.hashSync(req.body.password, 10),
  };

  req.session.user_id = userID;

  res.redirect("/urls");
});

// ------------- Get Register ----------------------------//
app.get("/register", (req, res) => {
  const user_id = users[req.session.user_id];
  const templateVars = { user_id };
  if (!user_id) {
    return res.render("urls_register", templateVars);
  }
  res.redirect("/urls");
});
//--------------end of registration route ------------------//
/////////////////////////////////////////////////////////////
// ---Login routes --------Login Post---------------------//
app.post("/login", (req, res) => {
  console.log("REQ DAT BOOOODY", req.body);
  const { email, password } = req.body;
  console.log("PASSWORD =====>", password);
  // Login validation logic
  const userID = getUserByEmail(email, users);
  if (bcrypt.compareSync(password, users[userID].password)) {
    req.session.user_id = userID;
    return res.redirect("/urls");
  }
  return res
    .status(403)
    .send("Information you've provided is incorrect. Try again.");
});

// -------- Login Get ------------------------//
app.get("/login", (req, res) => {
  const user_id = users[req.session.user_id];
  const templateVars = { user_id };
  if (!user_id) {
    return res.render("urls_login", templateVars);
  }

  res.redirect("/urls");
});
//-----------End of login routes ---------------------------//

// ----------Logout route--------------//
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// ----@@----Main/Index page----@@-----------------//
app.get("/urls", (req, res) => {
  const user_id = users[req.session.user_id];
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls, user_id };
  // if(!user_id) {
  //   return res.status(403).send("You need to login first")
  // }
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});
/////@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@///////////

// ------------Create New URL link -------------------//
app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.session.user_id };
  if (!templateVars.user_id) {
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = { longURL, user_id: req.session.user_id };
  console.log("URL DATABASE ===>>>", urlDatabase);
  res.redirect(`/urls/${id}`);
});
//---------End of Creating new URL link/------------------//

// -------ID Route Handlers---------------------//
app.post("/urls/:id/edit", (req, res) => {
  const storedUserID = req.session.user_id;
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
  const userCheckID = req.session.user_id;
  const currentUser = users[userCheckID].id;
  const shortURL = req.params.shortURL;
  const accessRights = urlDatabase[shortURL].userID;
  if (userCheckID && currentUser) {
    if (currentUser === accessRights) {
      delete urlDatabase[shortURL];
      return res.redirect("/urls");
    }
  }
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
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

// ---!!!--- Server Initiation ---!!!-- //
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// --&&&--- Extra Routes ---&&&-----//
app.get("/", (req, res) => {
  res.redirect("/register");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
