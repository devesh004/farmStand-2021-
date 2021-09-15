const mongoose = require('mongoose');

const Product = require('./models/product');

mongoose.connect('mongodb://localhost:27017/farmStand', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Mongo Connection stablish");
    })
    .catch(err => {
        console.log("OH NO Mongo connection error!");
        console.log(err);
    })

// const p = new Product({ name: 'Apple', price: 30, category: 'fruit' });

// p.save()
//     .then(res => {
//         console.log("Your result");
//         console.log(res);
//     })
//     .catch(err => {
//         console.log("we get an error!!")
//         console.log(err);
//     })

// const seedProduct = [
//     {
//         name: 'Banana',
//         price: '30',
//         category: 'fruit'
//     },
//     {
//         name: 'milk',
//         price: '10',
//         category: 'dairy'
//     },
//     {
//         name: 'Brinjel',
//         price: '20',
//         category: 'vegetable'
//     }
// ]

// Product.insertMany(seedProduct)
//     .then(res => {
//         console.log(res);
//     })
//     .catch(err => {
//         console.log(err);
//     })
