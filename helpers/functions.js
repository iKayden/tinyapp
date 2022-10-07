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

const getUserByEmail = (email, database) => {
  if (!email) {
    return null;
  }
  for (const id in database) {
    if (database[id].email === email) {
      return id;
    }
  }
  return null;
};

function generateRandomId() {
  return Math.random().toString(36).substring(2, 6);
}

const urlsForUser = function (userID, database) {
  if (!userID || !database) {
    return null;
  }
  const userURLs = {};
  for (const url in database) {
    if (userID === database[url].user_id) {
      userURLs[url] = { longURL: database[url].longURL };
    }
  }
  return userURLs;
};

module.exports = {
  generateRandomId,
  generateRandomString,
  getUserByEmail,
  urlsForUser,
};
