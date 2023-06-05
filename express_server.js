const express = require("express");
const cookieParser = require("cookie-parser")
const app = express();
app.use(cookieParser())
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");


const urlsDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {}


app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsDatabase,
    username: req.cookies['username']
  };
  res.render("urls_index", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlsDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlsDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});
app.get("/register", (req, res) => {
  const user = users[req.session["user_id"]];

  const templateVars = {
    user
  }
  // This is used to check if the user is logged in if a user is logged in then it will redirect them to the urls page
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

// This route handles the registration form data
app.post("/register", (req, res) => {
  // This is used to get the email and password from the form
  const userID = generateRandomString
  const email = req.body.email;
  const password = req.body.password;

  const newUser = {
    id: userID,
    email: email,
    password: password
  };
  users[userID] = newUser;
  res.cookie('user_id', userID)
    res.redirect('/urls');
  });

app.get('/dashboard', (req, res) => {
  const userId = req.cookies.userId;
  const user = users[userId];
  res.render('dashboard,', {
    user
  });
});

function generateRandomString() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};


app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlsDatabase[shortURL];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('Short URL not found');
  }
});


app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlsDatabase[id];
  res.redirect('/urls')
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const updatedLongURL = req.body.longURL;

  res.redirect("/urls");
});

app.post('/login', (req, res) => {
  const {
    username
  } = req.body;
  console.log(username)
  res.cookie('username', username);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})


