const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const PORT = 8080;

// Outside functions and "databases" that reside in "helpers" folder
const {
  generateRandomId,
  generateRandomString,
  urlsForUser,
  getUserByEmail,
} = require("./helpers/functions");
const { urlDatabase, users } = require("./helpers/databases");

// middleware and settings for the Express server
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["keyA", "keyB"],
    maxAge: 24 * 60 * 60 * 1000, // storing cookies for 24 hours
  })
);

// =====******* GET Routes *******=====

// ==== redirection route that checks if the user is logged in or not ====
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.redirect("/login");
  }
  // Since user is logged in #urlsForUser fetches all the user's URLs if any
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls, user };
  res.render("urls_index", templateVars);
});

// ==== Routes for registering and logging in ====
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };
  if (!user) {
    return res.render("urls_register", templateVars);
  }
  // if user is valid redirect him to his index urls page
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };
  if (!user) {
    return res.render("urls_login", templateVars);
  }
  res.redirect("/urls");
});
// ==== End of Login and Register ====

// ==== Main Page ====
app.get("/urls", (req, res) => {
  // Capturing existing user or the absence of one
  const userID = req.session.user_id;
  const user = users[userID];
  // If there's no user the appropriate msg will be returned
  if (!user) {
    return res.send("You are not logged in. Please Log In or Register first.");
  }

  // Function checks all the user's urls (if any) and sends all the info to the index page
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls, user };
  res.render("urls_index", templateVars);
});

// ==== Route for an existing user to make a new short URL ====
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  }
  const templateVars = { user: users[userID] };
  res.render("urls_new", templateVars);
});

// ==== This route handles activities concerned with handling individual URLs====
app.get("/urls/:id", (req, res) => {
  const userSessionId = req.session.user_id;
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.send("This short URL does not exist.");
    return;
  }

  // Function that searches through db for URLs owned by logged in user
  // results are stored in a variable that will go trough a validation
  // after the pass it will be sent with other information in templateVars
  const urlsForGivenUser = urlsForUser(userSessionId, urlDatabase);

  if (!urlsForGivenUser[id]) {
    res.send("This is not your URL.");
    return;
  }

  // if user is logged in and owns URLs it will be returned and displayed to him
  const templateVars = {
    id,
    longURL: urlsForGivenUser[id].longURL,
    user: users[userSessionId],
  };
  res.render("urls_show", templateVars);
});

// ==== Redirects all short URLs to the Long URLs ====
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// JSON for Development use
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// =====******* End of GET Routes *******=====

// =====*******Start of POST Routes *******=====

// ==== Registering route end point ====
app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  //  Form validation logic
  if (!userEmail || !userPassword) {
    return res
      .status(400)
      .send("Provide a valid email and/or password, please.");
  }
  if (getUserByEmail(userEmail, users)) {
    return res
      .status(400)
      .send(
        `This email "${userEmail}" already exist. Try another password or choose another email.`
      );
  }
  // Generating random 6 letter ID for the new user and storing information on it
  const userID = generateRandomId();
  users[userID] = {
    id: userID,
    email: userEmail,
    password: bcrypt.hashSync(userPassword, 10),
  };
  // reassigning session user_id to the one we've just created
  req.session.user_id = userID;
  res.redirect("/urls");
});

//Login route with validation and fetching assets (if any) from the DB
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // helper function that checks existing email in the DB
  const userID = getUserByEmail(email, users);
  if (!userID) {
    res
      .status(403)
      .send("Information you've provided is incorrect. Try again.");
    return;
  }
  // password encryption comparing function is securely checks if the passwords are 
  //matching and returns boolean value. If (true) we are assigning session ID to
  // the user who is logged in
  if (bcrypt.compareSync(password, users[userID].password)) {
    req.session.user_id = userID;
    return res.redirect("/urls");
  }
});

// ==== Logs out user and clears his cookies before redirecting ====
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// ==== Main Page Updating Route ====
// if any updates to the index page/database are made this route handles the results
app.post("/urls", (req, res) => {
  // creating new short URL string and keeping all the info about the creator 
  // and original long URL
  const id = generateRandomString();
  const user_id = req.session.user_id;
  const longURL = req.body.longURL;
  urlDatabase[id] = { longURL, user_id };
  res.redirect(`/urls/${id}`);
});

// ==== DELETE route ====
// Handles verification if the URL for deletion is in URL as well as if the user
// is the actual owner of the URL he is trying to delete
app.post("/urls/:id/delete", (req, res) => {
  const userSessionID = req.session.user_id;
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.send("This short URL does not exist.");
    return;
  }
  // fetches all URLs owned by user
  const urlsForGivenUser = urlsForUser(userSessionID, urlDatabase);
  // if user does not owns the URL he is trying to delete it will send him an error msg
  if (!urlsForGivenUser[id]) {
    res.send("This is not your URL");
    return;
  }
  // after everything checked the URL will be deleted from the DB
  delete urlDatabase[id];
  return res.redirect("/urls");
});

// ==== EDIT route ====
//handles changes in long URLs after some verification and validation
app.post("/urls/:id/edit", (req, res) => {
  const userSessionID = req.session.user_id;
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.send("This short URL does not exist.");
    return;
  }
  const urlsForGivenUser = urlsForUser(userSessionID, urlDatabase);
  if (!urlsForGivenUser[id]) {
    res.send("This is not your URL.");
    return;
  }
  //after validation and fetching URLs in the user's possession this route will
  // reassign the value to the new changed/edited long URL
  urlDatabase[id].longURL = req.body.longURL;
  return res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});
// =====******* End of POST Routes *******=====

// ==== |||| Server Initiation |||| ====
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
