const express = require('express')
const app = express()
var cookieParser = require('cookie-parser')
const csrf = require('csurf')
const csrfMiddleware = csrf({ cookie: true });
const bodyParser = require('body-parser')
const path = require('path')
const port = process.env.start || 3000



var admin = require("firebase-admin");

var serviceAccount = require("C:/Users/STC/Downloads/helene-e8911-firebase-adminsdk-eggk3-9a760daca0.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



const { OAuth2Client } = require('google-auth-library');
const { auth } = require('firebase-admin');
const CLIENT_ID = "367667795258-7unbip6v5ch3s1iuri7khim2jkn95752.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser())
var parseForm = bodyParser.urlencoded({ extended: false })
app.use(csrfMiddleware)

app.all("*", (req, res, next) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    next();
});


app.get('/', keepmelogedin, (req, res) => { })

function keepmelogedin(req, res) {
    const sessionCookie = req.cookies.session || "";
    admin
        .auth()
        .verifySessionCookie(sessionCookie, true)
        .then((result) => {
            user = result;
            res.redirect('/dashboard')
        })
        .catch((error) => {
            res.render("index");
        });
}

app.get('/signinwithphone', (req, res) => {
    res.render('signinwithphone')

})

app.get('/signin', (req, res) => {
    res.render('signin')
})

app.get("/dashboard", verifyuser, (req, res) => {
    res.render('dashboard')
});

app.get('/profile', verifyuser, (req, res) => {
    res.render('profile')
})

app.get('/welcome', verifyuser, (req, res)=>{
    res.render('welcome')
})

function verifyuser(req, res, next) {
    const sessionCookie = req.cookies.session || "";
    admin
        .auth()
        .verifySessionCookie(sessionCookie, true /** checkRevoked */)
        .then((result) => {
            user = result;
            next()
        })
        .catch((error) => {
            res.redirect("/");
        });
}


app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();
    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000
    admin
        .auth()
        .createSessionCookie(idToken, { expiresIn })
        .then(
            (sessionCookie) => {
                // Set cookie policy for session cookie.
                const options = { maxAge: expiresIn, httpOnly: true, secure: true };
                res.cookie('session', sessionCookie, options);
                res.end(JSON.stringify({ status: 'success' }));
            },
            (error) => {
                res.status(401).send('UNAUTHORIZED REQUEST!');
            }
        );
});

app.get("/sessionLogout", (req, res) => {
    res.clearCookie("session");
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


