const express = require('express');
const app = express();
const port = 8081;
const path = require('path');
const session = require('express-session');

const passport = require('passport');
const YandexStrategy = require('passport-yandex').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

app.use(session({ secret: "supersecret", resave: true, saveUninitialized: true }));

let Users = [{'login': 'admin', 'email':'Aks-fam@yandex.ru'},
            {'login': 'local_js_god', 'email':'ilia-gossoudarev@yandex.ru'},
            {'login': 'Vova', 'email':'halkin1998@yandex.ru'},
            {'login': 'artemis9898',  'email':'artemis9898@mail.ru'}];

const findUserByLogin = (login) => {
    return Users.find((element)=> {
        return element.login == login;
    })
}

const findUserByEmail = (email) => {
    return Users.find((element)=> {
        return element.email.toLowerCase() == email.toLowerCase();
    })
}

app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => {
    done(null, user.login);
  });
  //user - объект, который Passport создает в req.user
passport.deserializeUser((login, done) => {
    user = findUserByLogin(login);
        done(null, user);
});

passport.use(new YandexStrategy({
    clientID: '423dd37142eb41bcb693b4790f165091',
    clientSecret: '541eb9e226d6447f9b662f26c264b566',
    callbackURL: "http://localhost:8081/auth/yandex/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    let user = findUserByEmail(profile.emails[0].value);
    user.profile = profile;
    if (user) return done(null, user);
    done(true, null);
  }
));

passport.use(new GitHubStrategy({
    clientID: '37f76a48257cf8d912a3',
    clientSecret: '6f57e1334e5f1597cfa144e855e3fbcab1b061f2',
    callbackURL: "http://localhost:8081/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    let user = findUserByEmail(profile.emails[0].value);
    user.profile = profile;
    if (user) return done(null, user);
    done(true, null);
  }
));


const isAuth = (req, res, next)=> {
    if (req.isAuthenticated()) return next();

    res.redirect('/sorry');
}


app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, 'main.html'));
});
app.get('/sorry', (req, res)=> {
    res.sendFile(path.join(__dirname, 'sorry.html'));
});


app.get('/auth/yandex', 
  passport.authenticate('yandex'));

app.get('/auth/yandex/callback', 
  passport.authenticate('yandex', { failureRedirect: '/sorry', successRedirect: '/private' }));


app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));
 

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/sorry', successRedirect: '/private' }));
 

app.get('/private', isAuth, (req, res)=>{
    res.send(req.user);
});

app.listen(port, () => console.log(`App listening on port ${port}!`))