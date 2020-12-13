const {accountType} = require('../utils/auth')

exports.isAuth = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
}

exports.alredayAuth = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/dashboard');
    }
    next();
}

exports.isAdmin =(req,res,next)=>{
    if(accountType(`${req.session.user.accountType}`) !== "Admin"){
        return res.redirect ("/dashboard");
    }
    next();
}

exports.isClientAdmin =(req,res,next)=>{
    if(accountType(`${req.session.user.accountType}`) === "Editor") {
        return res.redirect ("/dashboard");
    }
    next();
}

exports.isEditor =(req,res,next)=>{
    if(accountType(`${req.session.user.accountType}`) !== "Editor"){
        return res.redirect ("/dashboard");
    }
    next();
}
exports.isClient =(req,res,next)=>{
    if(accountType(`${req.session.user.accountType}`) !== "Client"){
        return res.redirect ("/dashboard");
    }
    next();

}
