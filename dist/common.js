"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var users = [{ id: 1, username: 'test', password: 'test' }];
var common = /** @class */ (function () {
    function common() {
        this.singleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiUHJlbSIsIm1vYiI6Ijk5NTg4NjMwNzIifQ.nxScWqgH-YPy3Ul1pgVzHH1au5Z8Pr2ePWj3GIiP0g4";
        this.singleTokenSecret = "prem@tss@123";
    }
    // static basicstaticToken(req:Request,res:Response, next:NextFunction){
    // //Get auth header value
    //     let bearerHeader=req.headers['authorization'];
    // // console.log('-----> ',req);
    //     // check for basic auth header
    //     if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
    //         return res.status(401).json({ message: 'Missing Authorization Header' });
    //     }
    //         // verify auth credentials
    //         const base64Credentials =  req.headers.authorization.split(' ')[1];
    //         const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    //         const [username, password] = credentials.split(':');
    //         if(typeof bearerHeader!=='undefined'){
    //         const user = users.find(u => u.username === username && u.password === password);
    //             if (user) {
    //                 let bearer=bearerHeader.split(' ');
    //                 let bearerToken=bearer[1];
    //                 req.statictoken=bearerToken;
    //                 next();
    //             }else{
    //                 return res.status(401).json({ message: 'Invalid Username or Password' }); 
    //             }
    //         }else{
    //             res.sendStatus(403);  
    //         }
    // }
    common.staticToken = function (req, res, next) {
        //Get auth header value
        var bearerHeader = req.headers['authorization'];
        //check if bearer is undefined
        if (typeof bearerHeader !== 'undefined') {
            //split at the space
            var bearer = bearerHeader.split(' ');
            //Get Token from array
            var bearerToken = bearer[1];
            //Set the token
            req.statictoken = bearerToken;
            //Next middleware
            next();
        }
        else {
            res.sendStatus(403);
        }
    };
    common.userToken = function (req, res, next) {
        //Get auth header value
        //  console.log(req.headers);
        var bearerHeader = req.headers['authorization'];
        // console.log(bearerHeader);
        //check if bearer is undefined
        if (typeof bearerHeader !== 'undefined') {
            //split at the space
            var bearer = bearerHeader.split(' ');
            //Get Token from array
            var bearerToken = bearer[1];
            //Set the token
            req.userToken = bearerToken;
            //Next middleware
            next();
        }
        else {
            res.sendStatus(403);
        }
    };
    common.qrcodeToken = function (req, res, next) {
        //Get auth header value
        //  console.log(req.headers);
        var bearerHeader = req.headers['x-qrcodekey'];
        // console.log(bearerHeader);
        //check if bearer is undefined
        if (typeof bearerHeader !== 'undefined') {
            //split at the space
            var bearer = bearerHeader.split(' ');
            //Get Token from array
            var bearerToken = bearer[1];
            //Set the token
            req.qrcodeToken = bearerToken;
            //Next middleware
            next();
        }
        else {
            res.sendStatus(403);
        }
    };
    common.prototype.validateEmailFormat = function (email) {
        var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return re.test(email);
    };
    return common;
}());
exports.common = common;
