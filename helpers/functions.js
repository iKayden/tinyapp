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

const urlOwnership = function (userID, database) {
  let userURLs = {};
  for (const url in database) {
    if (userID === database[url].user_id) {
      userURLs[url] = database[url];
    }
    return userURLs;
  }
};

module.exports = {
  generateRandomId,
  generateRandomString,
  getUserByEmail,
  urlOwnership,
};
