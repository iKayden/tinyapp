const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require("../helpers/functions.js");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
    longURL: "https://www.chaijs.com/guide/styles/",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
    longURL: "https://github.com/iKayden/tinyapp",
  },
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: "kayden",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    user_id: "kayden",
  },
  "extra": {
    longURL: "http://www.office.com",
    user_id: "dwight",
  },
};

describe("#getUserByEmail", () => {
  it("should return <<< a user  >>> with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
  it("should return <<< null >>> for an email that is << not in our data base>>", () => {
    const user = getUserByEmail("unknown@example.com", testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });
  it("should return <<< null >>> if the email string is <<empty/falsy>>", () => {
    const user = getUserByEmail("", testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });
});

describe("#urlsForUser", () => {
  it("should return <<< an object >>> if a user << in a data base >>", () => {
    const actual = urlsForUser("kayden", urlDatabase);
    assert.equal(typeof actual, "object");
  });
  it("should return <<< null >>> if there is << no data base >>", () => {
    const actual = urlsForUser("kayden");
    assert.equal(actual, null);
  });
  it("should return <<< null >>> if there is << an empty string in the user argument >>", () => {
    const actual = urlsForUser("", urlDatabase);
    assert.equal(actual, null);
  });
  it("should return an object in the proper format when a user is found", () => {
    const actual = urlsForUser("kayden", urlDatabase);
    const expected = {
      "9sm5xK": {
        "longURL": "http://www.google.com",
      },
      "b2xVn2": {
        "longURL": "http://www.lighthouselabs.ca",
      },
    };
    assert.deepEqual(actual, expected);
  });
});
