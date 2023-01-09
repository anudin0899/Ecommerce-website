var express = require('express');
var router = express.Router();
var producthelpers = require('../Helpers/product-helpers');
var userhelpers = require('../Helpers/user-helpers');

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}



/* GET home page. */


router.get('/', async function (req, res, next) {
  let user = req.session.user

  let cartCount = null
  if (req.session.user) {
    cartCount = await userhelpers.getCartCount(req.session.user._id)
  }
  producthelpers.getAllProduct().then((products) => {
    res.render('user/user-viewproduct', { products, user, cartCount })
  })

})


router.get('/login', (req, res) => { 
  if (req.session.user) {
    res.redirect('/')  
  }
  else { 
    //console.log(req.session.loginErr);
    res.render('user/login', {'loginErr':req.session.loginErr})
    req.session.loginErr = false
  }
})

//calling signup page
router.get('/signup', (req, res) => {
  res.render('user/signup')
})

//user signup page
router.post('/signup', (req, res) => {
  // If the form data is valid, call the doSignup function
  userhelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.user = response.user
    req.session.userLoggedIn = true
    res.redirect('/login')
  })
});

//user login page
router.post('/login', (req, res) => {
  userhelpers.doLogin(req.body).then((response) => {
    if (response.status) { 
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    }
    else {
      req.session.loginErr = true  
      res.redirect('/login')
    }
  })
}) 

//logout page
router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})

//cart page
router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userhelpers.getCartProduct(req.session.user._id)
  let totalValue = 0
  if (products.length > 0) {
    totalValue = await userhelpers.getTotalAmount(req.session.user._id)
  } 
  //console.log(totalValue);
  //console.log(products);
  console.log('***' + req.session.user._id);
  res.render('user/cart', { products, user: req.session.user, totalValue })
})

router.get('/add-to-cart/:id', (req, res) => {
  //console.log('api call') 
  userhelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})

router.post('/change-product-quantity', (req, res, next) => {
  //console.log(req.body);
  userhelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userhelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})  

router.post('/delete-cart-item', (req, res, next) => {
  userhelpers.deleteCartItem(req.body).then((response) => {
    res.json(response)
  })
})

router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userhelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order', { total, user: req.session.user })
})

router.post('/place-order', async (req, res) => {
  let products = await userhelpers.getCartProductList(req.body.userId)
  let totalPrice = await userhelpers.getTotalAmount(req.body.userId)
  userhelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    if (req.body['payment-method'] === 'cod') {
      res.json({ codSuccess: true })
    } else {
      userhelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)
      })

    }

  })
  //console.log(req.body)
})

router.get('/order-success', (req, res) => {
  res.render('user/order-success', { user: req.session.user })
})

router.get('/order', async (req, res) => {
  let orders = await userhelpers.getUserOrders(req.session.user._id)
  res.render('user/order', { user: req.session.user, orders })

})

router.get('/view-order-product/:id', async (req, res) => {
  let orderProducts = await userhelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-product', { user: req.session.user, orderProducts })

})

router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userhelpers.verifyPayment(req.body).then(()=>{
    userhelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('payment successfull');
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:'payment failed'})
  })
})


module.exports = router;














