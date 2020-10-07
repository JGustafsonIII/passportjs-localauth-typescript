import express from 'express';
import passport from './middleware/passportConfig';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import User from './models/User';
import ensureAuthentication from './middleware/ensureAuthentication';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secretcode',
    resave: true,
    saveUninitialized: true
}));

app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send(`
    <form action="/login" method="post">
    <div>
        <label>Username:</label>
        <input type="text" name="username"/>
    </div>
    <div>
        <label>Password:</label>
        <input type="password" name="password"/>
    </div>
    <div>
        <input type="submit" value="Log In"/>
    </div>
    </form>`);
});

app.get('/yo', ensureAuthentication, (req, res) => {
    res.send('yo');
})

app.get('/dashboard', ensureAuthentication, (req, res) => {
    res.send('Hello man');
})
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) throw err;
        if (!user) { res.send("No user exists"); } else {
            req.logIn(user, err => {
                if (err) throw err;
                res.json({ auth: true, userid: user.id });
            });
        }

    })(req, res, next);
});

User.create({
    username: 'admin',
    password: 'admin'
}).catch((err: any) => console.log(err));

app.listen(8000, () => console.log(`Server running at http://localhost:${8000}`));