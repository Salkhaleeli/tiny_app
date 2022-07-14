const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//Middleware

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.set('view engine', 'ejs');

//Global variables

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {};

// ROUTS
//   |
//   |
//   |
//   |
// GET

app.get('/login', (req,res) =>{
  res.render('login');
});

app.get('/register', (req, res)=>{
  res.render('registration')
})

app.get('/urls', (req, res)=>{
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user : users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // console.log(req.params.shortURL);
  const longUrl = urlDatabase[req.params.shortURL];
  res.redirect(longUrl);
});

app.get('/urls/:shortURL',(req, res) =>{
  const templateVars = { shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL], 
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_show', templateVars);
});

//Post

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL; 
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
}); 

app.post("/urls/:shortURL/modify", (req, res) => {
  const url = req.params.shortURL;
  // console.log('req.body', req.body);
  const newUrl = req.body.URL;
  urlDatabase[url] = newUrl;
  res.redirect('/urls');
  }); 

app.post('/login', (req, res)=>{
  // console.log('req.body', req.body);
  res.cookie('user_id', req.body.username);

  res.redirect('/urls');
})

app.post('/logout', (req, res)=>{
  res.clearCookie('user_id');
  res.redirect('/urls')
})

app.post('/register', (req, res)=> {
  const email = req.body.email;
  const password = req.body.password;
  if (!email|| !password) {
    res.status(400);
    res.send('Invalid Email or Password');
  }else if (emailLookup(email)) {
    res.status(400);
    res.send('Username already exists.. please try forget password which i havn\'t implement')
  }else{
  const id = generateRandomString(6);
  console.log('req.body', req.body);
  users[id] = {
    id :id,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', id);
  res.redirect('/register')
  }
})

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});

//functions:

const generateRandomString = function(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
};

const emailLookup = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }else{
      return false
    }
      
    }
  };