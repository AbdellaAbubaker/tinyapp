const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");


const urlsDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({
  extended: true
}));

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsDatabase
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

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlsDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`)
});

app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlsDatabase[shortURL];
   res.render('urls_show', {
    shortURL,
    longURL
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

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});


app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];


  res.render('urls_show', {
    shortURL: id,
    longURL
  });
});

app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('Short URL not found');
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  
  delete urlsDatabase[id];

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});



