const express = require('express');
const router = express.Router();
const Farm = require('../models/farm');
const User = require('../models/user')
const categories = ['fruit', 'dairy', 'vegetable']
const Product = require('../models/product')
const { isLoggedIn, validateFarm, validateProduct, isCreator, hasAlreadyFarm } = require('../middleware')
const catchAsync = require('../utils/catchAsync');
const { findByIdAndUpdate } = require('../models/product');

router.get('/', catchAsync(async (req, res) => {
    const farms = await Farm.find({});
    res.render('farms/index', { farms });
}))



router.get('/new', isLoggedIn, hasAlreadyFarm, (req, res) => {
    //req.flash('success', 'AFSDGFsgsdgdhjkdfhvjfkdvhdfjkvhdkfjvhfjdvnfjdvhvjsgdffsjsdjkcnsjkcnsdjcnsdjcnsdjcnsjdc')

    res.render('farms/new')
})

router.post('/new', isLoggedIn, hasAlreadyFarm, validateFarm, catchAsync(async (req, res) => {
    const newFarm = new Farm(req.body.farm);
    newFarm.creator = req.user._id;
    const user = await User.findById(req.user._id);
    user.farm = newFarm.id;
    await user.save();
    await newFarm.save();
    req.flash('success', 'Successfully added a new farm!')
    res.redirect('/farms');
}));


router.get('/myfarm', isLoggedIn, catchAsync(async (req, res) => {
    const id = req.user._id;
    const user = await User.findById(id);
    if (user.farm) {
        const farmId = user.farm._id;
        console.log(farmId);
        res.redirect(`/farms/${farmId}`)
    }
    else {
        req.flash('error', `Sorry You don't have any farm. Make sure You have a farm`)
        res.redirect('/farms');
    }
}))


router.get('/:id', catchAsync(async (req, res) => {
    const farm = await Farm.findById(req.params.id).populate('products').populate('creator');
    // console.log(farm);
    req.session.last_loc = req.originalUrl;
    res.render('farms/show', { farm });
}))

router.delete('/:id', isLoggedIn, isCreator, catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedfarm = await Farm.findByIdAndDelete(id);
    const user = await User.findById(deletedfarm.creator._id);
    const newUser = await User.findByIdAndUpdate(user._id, { farm: null });
    // console.log("helooo", newUser);
    res.redirect('/farms');
}))

router.get('/:id/edit', isLoggedIn, isCreator, catchAsync(async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    res.render('farms/edit', { farm });
}))

router.put('/:id', isLoggedIn, validateFarm, isCreator, catchAsync(async (req, res) => {
    const { id } = req.params;
    const updatedFarm = await Farm.findByIdAndUpdate(id, { ...req.body.farm }, { runValidators: true, new: true });
    req.flash('success', 'Successfully updated the farm!')
    res.redirect(`/farms/${id}`);
}))


router.get('/:id/products/new', isLoggedIn, isCreator, catchAsync(async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id)
    res.render('products/new', { categories, farm });
}))

router.post('/:id/products', isLoggedIn, isCreator, validateProduct, catchAsync(async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    const newProduct = new Product(req.body.product);
    farm.products.push(newProduct);
    newProduct.farm = farm;
    await farm.save();
    await newProduct.save();
    res.redirect(`/farms/${id}`);
}))

module.exports = router;