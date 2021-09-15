const AppError = require('./utils/AppError');
const { productSchema, farmSchema } = require('./schema.js');
const Product = require('./models/product');
const Farm = require('./models/farm');
const User = require('./models/user')
const { findById } = require('./models/product');

module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER", req.user)
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must signed in First')
        req.session.returnTo = req.originalUrl;
        // console.log(req.session)  //a property returnTo added to session 
        return res.redirect('/users/login');
    }
    next();
}

module.exports.alreadyLoggedIn = (req, res, next) => {
    if (req.user) {
        req.flash('error', 'you already logged In')
        return res.redirect('/farms')
    }
    return next();
}

module.exports.validateFarm = (req, res, next) => {
    const { error } = farmSchema.validate(req.body);  //error is built in error in joi
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400);
    }
    else {
        next();
    }
}

module.exports.isCreator = async (req, res, next) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    if (!farm.creator.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to edit this farm')
        res.redirect(`/farms/${id}`)
    }
    else {
        next();
    }
}

module.exports.isProductCreator = async (req, res, next) => {
    const { id } = req.params;
    const pro = await Product.findById(id).populate('farm');
    console.log(req.user._id);
    if (pro.farm.creator.equals(req.user._id)) {
        return next();
    }
    else {
        req.flash('error', `you don't have permission`)
        return res.redirect(`/products/${id}`);
    }
}


module.exports.hasAlreadyFarm = async (req, res, next) => {
    const id = req.user._id;
    const user = await User.findById(id);
    console.log(user)
    if (user.farm) {
        req.flash('error', 'You already have a farm!')
        res.redirect('/farms')
    }
    else {
        next();
    }
}

