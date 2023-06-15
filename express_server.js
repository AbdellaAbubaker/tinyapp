const express = require("express");
const app = express();



const cookieSession = require("cookie-session")
const bcrypt = require("bcryptjs");

const {
  generateRandomString,
  getUserByEmail,
  urlsForUser
} = require("./helpers");
const {
  users,
  urlDatabase
} = require("./database");
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");

app.use(cookieSession({
  name: "session",
  keys: ['keys1'],
  maxAge: 24 * 60 * 1000
}));

app.use(express.urlencoded({
  extended: true
}));

app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls")
  } else {
    res.redirect("/login")
  }
})

// Route for handling GET requests to "/urls"
app.get("/urls", (req, res) => {
  // Extract the user ID from the session
  const userId = req.session.user_id;
  const user = users[userId];
  console.log("userId", userId)
  console.log(req.session)

  // If the user is not logged in, send a 401 Unauthorized status and an error message
  if (!user) {
    return res.status(401).send("Please login or register");
  }


  // Get the URLs associated with the user
  const userURL = urlsForUser(userId, urlDatabase);

  // Prepare the template variables for rendering the "urls_index" view
  const templateVars = {
    urls: userURL,
    user,
  };

  // Render the "urls_index" view and pass in the template variables
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // This variable is used to get the user from the users object
  const userId = req.session.user_id;
  const user = users[userId];

  // This is used to check if the user exists
  if (!user) {
    return res.redirect("/login")
    // If the user does exist then render the urls_new.ejs file
  }

  const templateVars = {
    user
  };

  // console.log(templateVars)
  res.render("urls_new", templateVars);


});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id
  const user = users[userId];

  if (!user) {
    return res.status(401).send("Please login or register");

  }
  const url = urlDatabase[req.params.id]
  if (!url) {
    return res.status(404).send("URL not found");
  }
  if (url.userID !== userId) {
    return res.status(403).send("You don't have access to this URL")
  }

  const templateVars = {
    id: req.params.id,
    longURL: url.longURL,
    user,
  };
  res.render("urls_show", templateVars);
})

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    return res.status(401).send("Please login or register");

  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userId,
  };

  res.redirect(`/urls/${shortURL}`);

});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.status(401).send("Please login or register")
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send("url not found");
  }
  if (url.userID !== req.session.user_id) {
    return res.status(403).send("You dont have access to this URL");
  }

  const id = req.params.id;
  delete urlDatabase[id]
  res.redirect("/urls")
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  

  if (!user) {
    return res.status(404).send("URL not found")
  }
  if (url.userID !== req.session.user_id) {
    return res.status(403).send("You dont have access to this URL");
  }

  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL
  res.redirect("/urls")
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(400).send("URL not found");
  } else {
    const url = urlDatabase[req.params.id].longURL
    res.redirect(url);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email; and password can't be blankled")
  }
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(400).send("Email not found. Please register");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send("Password incorrect")
  }
  req.session.user_id = user.id;
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user
  }

  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Email or password is empty");
    return
  }
  if (getUserByEmail(email, users)) {
    res.status(400).send("Email is already in the database. Please login");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString()


  const newUser = {
    id,
    email,
    password: hashedPassword
  }
  console.log("id", id)
  req.session.user_id = id
  users[id] = newUser;
  res.redirect("/urls")
})

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    user
  }


  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars)
  }

})
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});