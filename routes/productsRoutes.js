const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const categories = ['fruit', 'dairy', 'vegetable']
const { isLoggedIn, validateProduct, isProductCreator } = require('../middleware')
const catchAsync = require('../utils/catchAsync');
const Farm = require('../models/farm');


router.get('/', async (req, res, next) => {
    try {
        const { category } = req.query;
        if (category) {
            const products = await Product.find({ category });
            req.session.last_loc = req.originalUrl;
            res.render('products/index', { products, category });
        }
        else {
            const products = await Product.find({});
            req.session.last_loc = req.originalUrl;
            res.render('products/index', { products, category: 'All' });
        }
    }
    catch (err) {
        next(err);
    }
})



// router.get('/new', isLoggedIn, (req, res) => {
//     res.render('products/new', { categories });
// })

// router.post('/', isLoggedIn, validateProduct, async (req, res, next) => {  //new product
//     try {
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.redirect(`/products`)
//     }
//     catch (err) {
//         next(err);
//     }
// })

router.get('/:id', catchAsync(async (req, res, next) => {
    // try {
    //     const product = await Product.findById(req.params.id)
    //     res.render('products/show', { product })
    // }
    // catch (err) {
    //     return next(new AppError('Product Not found', 404))
    // }
    const product = await Product.findById(req.params.id).populate('farm');
    // console.log(product.farm);
    res.render('products/show', { product })
}))

router.get('/:id/edit', isLoggedIn, isProductCreator, catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.render('products/edit', { product, categories });
}))

router.put('/:id', isLoggedIn, isProductCreator, validateProduct, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndUpdate(id, { ...req.body.product }, { runValidators: true, new: true });
    // console.log(updatedFarm);
    req.flash('success', 'Successfully Updated the product!')
    res.redirect(`/products/${id}`);
}))

router.delete('/:id', isLoggedIn, isProductCreator, catchAsync(async (req, res) => {
    const { id } = req.params;
    const pro = await Product.findById(id);
    // console.log(pro);
    const farmId = pro.farm._id;
    await Farm.findByIdAndUpdate(pro.farm._id, { $pull: { products: id } });
    const deleteProduct = await Product.findByIdAndDelete(id);
    // console.log("last Location was", req.session.last_loc);
    const lastUrl = req.session.last_loc;
    res.redirect(lastUrl);
}));

module.exports = router;

