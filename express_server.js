const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//Middleware

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set('view engine', 'ejs');
const bcrypt = require('bcrypt')
//Global variables

const urlDatabase = {};

const defTemplateVars = {
  user : null
}

const users = {};

// ROUTS
//   |
//   |
//   |
//   |
// GET

app.get('/login', (req,res) =>{
  res.render('login', defTemplateVars);
});

app.get('/register', (req, res)=>{
  res.render('registration', defTemplateVars);
})

app.get('/urls', (req, res)=>{
  const userURl = urlsForUser(req.cookies['user_id'])
  const templateVars = { 
    urls: userURl,
    user: users[req.cookies["user_id"]]
  };
  if (templateVars.user) {
    res.redirect('urls_index', templateVars)
  } else {
    res.render('urls_index', defTemplateVars)
  }
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user : users[req.cookies["user_id"]]
  };
  if (templateVars.user) {
    res.render('urls_new', templateVars)
  } else {
    res.redirect('/login')
  }
});

app.get("/u/:shortURL", (req, res) => {
  // console.log(req.params.shortURL);
  const longUrl = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longUrl);
});

app.get('/urls/:shortURL',(req, res) =>{
  const templateVars = { shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL, 
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_show', templateVars);
});

//Post

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  }
  res.redirect('/urls')
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(404);
    res.send('can\'t perform this operation')
  }
}); 

app.post("/urls/:shortURL/modify", (req, res) => {
  if (req.cookies['user_id'] === urlDatabase[req.params.shortURL].userID) {
    const url = req.params.shortURL;
    const newUrl = req.body.URL;
    urlDatabase[url].longURL = newUrl;
    res.redirect('/urls');
  } else {
    res.status(404);
    res.send('can\'t perform this operation')
  }
  }); 

app.post('/login', (req, res)=>{
  // console.log('req.body', req.body);
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(email);
  if (user) {
    const passwordMatching = bcrypt.compareSync(password, users[user].password);
    if (passwordMatching) {
      res.cookie('user_id', users[user].id);
      res.redirect('/urls');
    } else {
      res.status(403);
      res.send('Invalid Password');
    }
  } else {
    res.status(403);
    res.send('invalid email please register');
  }
});

app.post('/logout', (req, res)=>{
  res.clearCookie('user_id');
  res.redirect('/urls')
})

app.post('/register', (req, res)=> {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email|| !password) {
    res.status(400);
    res.send('Invalid Email or Password');
  }else if (emailLookup(email)) {
    res.status(400);
    res.send('Email already exists.. please try forget password which i havn\'t implement')
  }else{
  const id = generateRandomString(6);
  console.log('req.body', req.body);
  users[id] = {
    id :id,
    email: email,
    password: hashedPassword
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
      return user;
    }
      
    }
    return false;
  };


  const urlsForUser = function(id) {
    const userURLs = {};
    for (let url in urlDatabase){
      if (urlDatabase[url].userID === id) {
        userURLs[url] = urlDatabase[url];
      }
    }
    return userURLs;
  };