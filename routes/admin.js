const { response } = require('express');
var express = require('express');
var router = express.Router();
var producthelpers = require('../Helpers/product-helpers')

//verify login

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/adminLogin')
  }
}



/* GET users listing. */



router.get('/', function (req, res, next) {

  producthelpers.getAllProduct().then((products) => {
    res.render('admin/view-products', { products,admin:true })
  })

});

//adminlogin page calling
router.get('/adminLogin',(req,res)=>{
  if(req.session.admin){
    res.redirect('/')
  }
  res.render('admin/adminLogin',{'loginErr':req.session.adminLoginErr})
  req.session.adminLoginErr = false
})

//adminlogin 
router.post('/adminLogin',(req,res)=>{
  console.log(req.body);
  producthelpers.doAdminLogin(req.body).then((response)=>{
    console.log(response);
    if(response.status){
      req.session.adminLoggedIn = true
      req.session.admin = response.admin
      res.redirect('/')
    }else{
      req.session.adminLoginErr = true
      res.redirect('/adminLogin')
    }

  })
});

//admin logout
router.get('/adminLogout',(req,res)=>{
  req.session.admin = null
  req.session.adminLoggedIn = false
  res.redirect('/')
})

//admin signup page calling
router.get('/adminSignup',(req,res)=>{
  res.render('admin/adminSignup')
})

//adminsigup
router.post('/adminSignup',(req,res)=>{
  console.log(req.body);
  producthelpers.doAdminSignup(req.body).then((response)=>{
    console.log(response);
    req.session.adminLoggedIn = true
    req.session.admin = response.admin
    res.redirect('/adminLogin')
  })
});


//calling add-product page
router.get('/add-products', function (req, res) {
  res.render('admin/add-products')
})

router.post('/add-products', (req, res) => {
  producthelpers.addproducts(req.body, (insertedId) => {
    let images = req.files.Image
    //console.log(insertedId);
    images.mv('./public/product-image/' + insertedId + '.jpg', (err) => {
      if (!err) {
        res.render('admin/add-products')
      }
      else {
        console.log(err);
      }
    })
  })
})

router.get('/delete-product/:id', (req, res) => {
  let prodId = req.params.id
  console.log(prodId);
  producthelpers.deleteProduct(prodId).then((response) => {
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id', async (req, res) => {
  let product = await producthelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product', { product })
})

router.post('/edit-product/:id', (req, res) => {
  insertedId = req.params.id
  producthelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.Image) {
      let images = req.files.Image
      images.mv('./public/product-image/' + insertedId + '.jpg')
    }
  })
})
module.exports = router;





