var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt');

module.exports = {

    doAdminSignup:(adminData)=>{
        console.log(adminData);
        return new Promise(async(resolve,reject)=>{
            adminData.Password = await bcrypt.hash(adminData.Password, 10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                resolve(data)
            })
        })
    },

    doAdminLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email:adminData.Email })
            if (admin) {

                bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.admin = admin
                        response.status = true
                        resolve(response)
                    }
                    else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            }
            else {
                console.log('login failed');
                resolve({ status: false })
            }
        })

    },


    addproducts: (product, callback) => {

        db.get().collection('product').insertOne(product).then((data) => {
            console.log(data.insertedId);
            callback(data.insertedId);

        })
    },
    getAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            console.log(proId);
            console.log(objectId(proId));
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(proId) }).then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },

    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                resolve(product)
            })
        })
    },

    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                $set: {
                    Name: proDetails.Name,
                    Price: proDetails.Price,
                    Category: proDetails.Category,
                    Description: proDetails.Description
                }
            }).then((response) => {
                resolve(response)
            })
        })
    }



}