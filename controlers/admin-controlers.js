const adminHelpers = require('../helpers/admin-helpers');
let { check, validationResult } = require('express-validator');
const { response } = require('express');
let userStatus
module.exports = {
    adminLoginGet: (req, res) => {
        if(req.session.admin)
        {
            res.redirect('/admin/dashboard')
        }
        else
        {
            res.render('admin/loginAdmin', { loginErr: req.session.loginError })
            req.session.loginError = null;
        }
    },
    adminLoginPost: (req, res) => {
            adminHelpers.adminLogin(req.body).then((response) => {
                if (response.status) {
                    req.session.adminLoggedIn = true;
                    req.session.admin = response.admin;
                    console.log(req.session);
                    res.redirect('/admin/dashboard')
                }
                else if (response.notExist) {
                    req.session.loginError = "Invalid email address..."
                    res.redirect('/admin')
                }
                else {
                    req.session.loginError = "Incorrect password "
                    res.redirect('/admin')
                }
            })
    },
    adminDashboard: (req, res) => {
        // if(req.session.admin)
        // {
            res.render('admin/index',{admin:true})
        // }
        // else{
        //     res.redirect('/admin')
        // }
        
    },
    addProducts1Get: (req, res) => {
        res.render('admin/add-product',{admin:true})
    },
    addProducts1Post: (req, res) => {
        const errors = validationResult(req);
        console.log(errors);
        adminHelpers.addProducts(req.body).then((data) => {
            console.log(data)
            // res.redirect('/addProduct')
        })
    },
    addProducts2Get: (req, res) => {
        res.render('admin/add-product2',{admin:true})
    },
    addProducts3Get: (req, res) => {
        res.render('admin/add-product3',{productAddingErr:req.session.addProductError,productAddingSucc:req.session.addProductSuccess,Prostatus:req.session.addProductStatus,admin:true})
        req.session.addProductError=null;
        req.session.addProductStatus=null;
        req.session.addProductSuccess=null;
    },
    addProducts3Post:(req,res)=>{
        const errors = validationResult(req);
        // console.log(errors);
        console.log(req.body);
        req.session.addProductError=errors.errors;
        if(req.session.addProductError.length==0)
        {
            adminHelpers.addProducts(req.body).then((data) => {
                let image = req.files.product_image;
                let objId=data.insertedId;
                image.mv('./public/images/' + objId + '.jpg', err =>
                {
                    if(!err)
                    {
                        req.session.addProductSuccess="Successfully added product you can add another product..."
                        req.session.addProductStatus=true;
                        res.redirect('/admin/addProduct3')
                    }
                    else
                    {
                        req.session.addProductStatus=false;
                        res.redirect('/admin/addProduct3')
                    }
                })
            })
        }
        else
        {
            req.session.addProductStatus=false;
            res.redirect('/admin/addProduct3')
        }
    },
    addProducts4Get: (req, res) => {
        res.render('admin/add-product4',{admin:true})
    },
    viewProductList:(req,res)=>{
        adminHelpers.viewProduct().then((products)=>{
            // console.log(products);
            res.render('admin/view-product-list',{admin:true,products})
        })
        
        
    },
    editProductsListGet:(req,res)=>{
        let productId=req.params.id
        adminHelpers.getProductDetails(productId).then((product)=>{
            console.log(product);
            res.render('admin/edit-product',{product,Prostatus:req.session.updateProductStatus,updateErr:req.session.updateProductError,updateMsg:req.session.updateMsg,admin:true});
            req.session.updateProductError=null;
            req.session.updateProductStatus=null;
            req.session.updateMsg=false;
        })
        

    },
    editProductsListPut:(req,res)=>{
        let productId=req.params.id;
        console.log(req.session)
        const errors = validationResult(req);
        console.log(errors);
        req.session.updateProductError=errors.errors;
        if(req.session.updateProductError.length==0)
        {
            adminHelpers.updateProductsList(productId,req.body).then(()=>{
                req.session.updateProductStatus=true;
                req.session.updateMsg="Product updated successfully..";
                res.redirect('/admin/viewPoductsList');
                if (req.files) {
                  let image = req.files.product_image;
                  let objId = req.params.id;
                  image.mv('./public/post-images/' + objId + '.jpg');
                }
            })
        }
        else{
            req.session.updateProductStatus=false;
            res.redirect(`/admin/editProductsList/${productId}`);
        }
    },
    disableAndEnableProduct:(req,res)=>{
        // console.log(req.body); 
        let {productId,isActive}=req.body;   
        adminHelpers.disableEnableProduct(productId,isActive).then((resp)=>{
            res.json(resp.value);
            console.log(resp.value);
        })

    },
    viewProductsGrid:(req,res)=>{
        res.render('admin/view-products-grid',{admin:true})
    },
    viewProductsGrid2:(req,res)=>{
        res.render('admin/view-products-grid2',{admin:true})

    },
    addCategoryGet:(req,res)=>{
        adminHelpers.getAllCategories().then((category)=>{
            res.render('admin/view-products-category',{admin:true,category,deletedCategory:req.session.categoryDeleted,addedCategory:req.session.addedCategory})
            req.session.categoryDeleted=null;
            req.session.addedCategory=null;
        })
       
    },
    addCategoryPost:(req,res)=>{
        console.log(req.body);
        adminHelpers.addCategories(req.body).then((data)=>{
            // console.log(data);
            req.session.addedCategory="Added Category you can add another one"
            res.redirect('/admin/addProductCategory');

        })

    },
    editCategoryGet:(req,res)=>{
        let catId=req.params.id;
        adminHelpers.getCurrentCategory(catId).then((category)=>{
            res.render("admin/edit-product-category",{admin:true,category})
        })
        

    },
    editCategoryPut:(req,res)=>{
        let catId=req.params.id;
        adminHelpers.updateCurrentCategory(catId,req.body).then((status)=>{
            console.log(status)
            res.redirect('/admin/addProductCategory')
        })
       

    },
    deleteProductCategory:(req,res)=>{
        let catId = req.params.id;
        adminHelpers.deleteProductCategory(catId).then((response)=>{
            console.log(response);
            req.session.categoryDeleted="Deleted Category"
            res.redirect('/admin/addProductCategory');
        })

    },
    viewUsers:(req,res)=>{
        adminHelpers.viewAllUser().then((users)=>{
            // console.log(users)
            // console.log(userStatus)
            res.render('admin/view-users',{users,admin:true})
        })

    },
    blockAndUnblockUsers:(req,res)=>{
        console.log(req.body);
        adminHelpers.blockUnblockUsers(req.body).then((userStat)=>{
            console.log(userStat);
            res.json(userStat)
            // userStatus=userStat;
            // console.log(userStatus+"  promise");
        })

    },
    getBlockedUsers:(req,res)=>{
        adminHelpers.blockedUsers().then((blockeduser)=>{
            res.render('admin/blocked-users',{admin:true,blockeduser})
            console.log(blockeduser);

        })

    },
    logoutAdmin:(req,res)=>{
        req.session.admin=null;
        res.redirect('/admin');
    }
}