const express = require('express')
const app = express()
const csrf = require('csurf')
var csrfProtection = csrf({ cookie: true })
var cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
var admin = require('firebase-admin');
var serviceAccount = require("./serviceAccountkey.json");
const path = require('path')
const port = process.env.start || 3000

const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = "367667795258-7unbip6v5ch3s1iuri7khim2jkn95752.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID);

// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyATUp1nFk_6iAmecTgIppNH-KCV6c2yoBE",
    authDomain: "helene-e8911.firebaseapp.com",
    projectId: "helene-e8911",
    storageBucket: "helene-e8911.appspot.com",
    messagingSenderId: "367667795258",
    appId: "1:367667795258:web:66302e4990755b65b42c03",
    measurementId: "G-ZGELHY7LS5"
};

firebase.initializeApp(firebaseConfig);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser())

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/dashboard', checkuserAuth, (req, res) => {
    let user = req.user;
    res.render('dashboard', { user });
})

app.post('/dashboard', (req, res) => {
    let userIdtoken = req.body.idtoken;
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: userIdtoken,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
    }
    verify()
        .then(() => {
            res.cookie('session-token', userIdtoken);
            res.send('success')
        }).catch(console.error);
});

app.get('/logout', (req, res) => {
    firebase.auth().signOut().then(() => {
        const sessionCookie = req.cookies.session || '';
        res.clearCookie('session-token')
        admin
            .auth()
            .verifySessionCookie(sessionCookie)
            .then((decodedClaims) => {
                return admin.auth().revokeRefreshTokens(decodedClaims.sub);
            })
            .then(() => {
                res.redirect('/');
            })
            .catch((error) => {
                res.redirect('/');
            });
    });
})



    function checkuserAuth(req, res, next) {
        let userIdtoken = req.cookies['session-token'];

        let user = {};
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: userIdtoken,
                audience: CLIENT_ID,
            });
            const payload = ticket.getPayload();
            // const userid = payload['sub'];
            user.name = payload.name;
            user.email = payload.email;
        }
        verify()
            .then(() => {
                req.user = user;
                next()
            })
            .catch((err) => {
                res.redirect('/')
            })

    }

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })