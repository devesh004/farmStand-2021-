if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const AppError = require('./utils/AppError')
const User = require('./models/user')
const { findByIdAndUpdate, findByIdAndDelete } = require('./models/product');
const { error } = require('console');
const { format } = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize')


const farmsRoute = require('./routes/farmsRoutes');
const productsRoute = require('./routes/productsRoutes')
const usersRoute = require('./routes/usersRoutes');
const ejsMate = require('ejs-mate');
const { getMaxListeners } = require('process');
const { contentSecurityPolicy } = require('helmet');

const MongoDBStore = require('connect-mongo')(session);


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/farmStand'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongoose connection error:'));
db.once('open', function () {
    console.log("mongoose connection establish")
});

app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.use(express.static(path.join(__dirname, 'public')));  //we want to serve public directory in every file so we can use the functionality of the file inside it without requiring
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisisnotgoodsecret'

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionOptions = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionOptions));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false, })); //deal with 11 middleware 

app.use(passport.initialize());
app.use(passport.session());  // to trace login logout
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());


//this middleware is accessable everywhere
app.use((req, res, next) => {
    //we have a method req.user everywhere thanks to passport this tells us user details if any user is logged in 
    // req.locals.currUser = req.user; //now we have a currUser in every file (at any time we can check if any user is logged out)
    res.locals.currUser = req.user;
    res.locals.success = req.flash('success');  //now messages can be use in any route
    res.locals.error = req.flash('error');
    next();
})
const handleValidationErr = err => {
    //console.dir(err)
    return new AppError(`Validation Failed ...${err.message}`, 400)
}

app.use('/farms', farmsRoute);
app.use('/products', productsRoute);
app.use('/users', usersRoute);


app.get('/', (req, res) => {
    res.render('../home.ejs')
})


// app.use((err, req, res, next) => {
//     console.log(err.name);
//     if (err.name === 'ValidationError') {
//         err = handleValidationErr(err)
//     }
//     next(err);
// })

app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found!', 404))
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).render('error', { message })
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`YOU ARE LISTENING PORT:${port}`);
})

