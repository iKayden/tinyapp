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

const urlOwnership = function (userID, database) {
  console.log("userID", userID);
  console.log("DATABASE ----->", database);
  let userURLs = {};
  for (const url in database) {
    if (userID === database[url].user_id) {
      userURLs[url] = database[url];
    }
  }
  return userURLs;
};

module.exports = {
  generateRandomId,
  generateRandomString,
  getUserByEmail,
  urlOwnership,
};
