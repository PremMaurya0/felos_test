"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = __importStar(require("mongoose"));
var customerModel_1 = require("../models/customerModel");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var speakeasy_1 = __importDefault(require("speakeasy"));
var qrcode_1 = __importDefault(require("qrcode"));
var common_1 = require("../common");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var nodemailer_1 = __importDefault(require("nodemailer"));
var moment = require("moment");
var _ = require("underscore");
var Cryptr = require('cryptr');
var userTfavar = new common_1.common();
var Customer = mongoose.model('Customer', customerModel_1.CustomerSchema);
var Bank = mongoose.model('BankDetail', customerModel_1.BankAccountSchema);
var ATMCard = mongoose.model('ATMCardDetail', customerModel_1.ATMCardSchema);
var KYCDocument = mongoose.model('eKYCCustomer', customerModel_1.eKYCSchema);
var AddFund = mongoose.model('AddFundCustomer', customerModel_1.AddCustomerFundSchema);
var CustomerTransaction = mongoose.model('TransactionCustomer', customerModel_1.CustomerTransactionHistorySchema);
var transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: 'premteastallstudio@gmail.com',
        pass: 'SmartBoy@@123'
    }
});
var cryptr = new Cryptr('fellobyPrem@123');
var CustomerController = /** @class */ (function () {
    function CustomerController() {
    }
    CustomerController.prototype.groupBy = function (key, array) {
        array.reduce(function (objectsByKeyValue, obj) {
            var value = obj[key];
            objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
            return objectsByKeyValue;
        }, {});
    };
    // Tfauser =new userObject();
    CustomerController.prototype.addNewCustomer = function (req, res) {
        var customer = new Customer(req.body);
        if (customer.firstName === "" || customer.firstName === undefined) {
            res.status(428).json({ message: "Enter Your Name!", error: true, success: false });
        }
        else if (customer.mobileNumber.length === 0 || customer.mobileNumber === "" || customer.mobileNumber === undefined) {
            res.status(428).json({ message: "Enter Your Mobile Number!", error: true, success: false });
        }
        else if (customer.mobileNumber.length !== 10) {
            res.status(412).json({ message: "Enter Your valid Mobile Number!", error: true, success: false });
        }
        else if (customer.userPassword === "" || customer.userPassword === undefined) {
            res.status(428).json({ message: "Enter Your password", error: true, success: false });
        }
        else if (customer.userPassword.length <= 6) {
            res.status(411).json({ message: "Password is too sort!", error: true, success: false });
        }
        else {
            Customer.findOne({ mobileNumber: customer.mobileNumber }, function (err, existruslt) {
                if (err)
                    res.send(err);
                if (existruslt) {
                    res.json({ message: "Mobile number already exist", error: true, success: false });
                }
                else {
                    bcryptjs_1.default.genSalt(10, function (err, salt) {
                        if (err)
                            res.send(err);
                        bcryptjs_1.default.hash(customer.userPassword, salt, function (err, hash) {
                            if (err)
                                res.send(err);
                            customer.userPassword = hash;
                            customer.save(function (err, result) {
                                if (err)
                                    res.send(err);
                                res.status(201).json({ message: "Successfully created!", error: false, success: true, result: result });
                                // if(customer.emailAddress!=undefined || customer.emailAddress!="abc@abc.com"){
                                //     jwt.sign({user:customer.mobileNumber},customer.mobileNumber,{ expiresIn: 300 },(err:any,token:any)=>{
                                //         if(err) res.send(err);
                                //         else{
                                //           //  res.setHeader('Authorization','Bearer '+ token);
                                //             let mailOptions = {
                                //                 from: 'premteastallstudio@gmail.com',
                                //                 to: customer.emailAddress,
                                //                 subject: 'Felos Email-Verification',
                                //                 text: 'That was easy!',
                                //                 html: '<h1>Welcome- '+customer.firstName+'</h1><p><a href="http://localhost:3001/api/v1/email-verify/'+token+'">Email Verification</a></p><p>http://localhost:3001/api/v1/email-verify/'+token+'</p>'
                                //               };
                                //              transporter.sendMail(mailOptions, function(error, info){
                                //                 if (error) {
                                //                   res.send(error);
                                //                 } else {
                                //                     res.json({message:"Successfully created!",error:false,success:true,result});
                                //                 }
                                //               });
                                //         }
                                //     });                       
                                // }else{
                                //     res.json({message:"Successfully created!",error:false,success:true,result});
                                // }
                            });
                        });
                    });
                }
            });
        }
    };
    // TFA Login Authentication
    CustomerController.prototype.customerLogin = function (req, res) {
        jsonwebtoken_1.default.verify(req.statictoken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.status(403).send({ message: "Invalid Token please enter your valid token" });
            else {
                var CustomerCheck_1 = new Customer(req.body);
                //  console.log(userTfavar.mobileNumber);
                // console.log(userTfavar.tfa.tempSecret);
                Customer.findOne({ mobileNumber: CustomerCheck_1.mobileNumber }, function (err, result) {
                    if (err)
                        res.send(err);
                    if (result) {
                        if (result.verifyEmail == 1 || result.verifyEmail == 0) {
                            //  console.log(userTfavar.tfa.secret);
                            // if (!userTfavar.tfa || !userTfavar.tfa.secret) {
                            bcryptjs_1.default.compare(CustomerCheck_1.userPassword, result.userPassword, function (err, isMatch) {
                                if (err)
                                    throw err;
                                if (isMatch) {
                                    console.log("DEBUG: Login without TFA is successful");
                                    jsonwebtoken_1.default.sign({ user: result.mobileNumber, name: result.firstName, _Id: result._id, kycstatus: result.kycStatus, bankstatus: result.accountStatus, balance: result.remainingAmount, url: result.profilePic }, userTfavar.singleTokenSecret, function (err, token) {
                                        res.setHeader('X-Token', token);
                                        res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                                        Customer.findOneAndUpdate({ mobileNumber: CustomerCheck_1.mobileNumber }, { $set: { loginStatus: 1 } }, { upsert: true }, function (err) {
                                            if (err)
                                                res.send(err);
                                            return res.status(200).json({
                                                message: "success without enabled TFA",
                                                data: result.firstName,
                                                tfaenabled: result.enableTfa
                                            });
                                        });
                                    });
                                }
                                else {
                                    console.log("DEBUG: Login without TFA is Invalid");
                                    return res.status(401).json({
                                        "message": "Invalid username or password"
                                    });
                                }
                            });
                            // }
                            //   else{
                            //       if(userTfavar.mobileNumber){
                            //           bcrypt.compare(CustomerCheck.userPassword, result.userPassword, (err, isMatch)=> {
                            //           if(err) throw err;
                            //           console.log(isMatch);
                            //           if(!isMatch){
                            //               console.log(`ERROR: Login with TFA is not successful`);
                            //               return res.send({
                            //                   "status": 403,
                            //                   "message": "Invalid username or password"
                            //                   });
                            //                }
                            //           });                     
                            //       }
                            //       if (!req.headers['x-tfa']) {
                            //           console.log(`WARNING: Login was partial without TFA header`);
                            //           return res.send({
                            //               "status": 206,
                            //               "message": "Please enter the Auth Code"
                            //           });
                            //       }
                            //       console.log(userTfavar.tfa.secret,'-->')
                            //       console.log(req.headers['x-tfa']);
                            //       let xtfa:any =req.headers['x-tfa']
                            //       let isVerified = speakeasy.totp.verify({
                            //           secret: userTfavar.tfa.secret,
                            //           encoding: 'base32',
                            //           token: xtfa
                            //       });
                            //       if (isVerified) {
                            //           console.log(`DEBUG: Login with TFA is verified to be successful`);
                            //                 Customer.findOne({mobileNumber:CustomerCheck.mobileNumber},(err,resultTFA:ICustomer)=>{
                            //                   if(err) res.send(err);
                            //                   jwt.sign({user:resultTFA.mobileNumber,name:resultTFA.firstName,_Id:result._id,kycstatus:result.kycStatus,bankstatus:result.accountStatus,balance:result.remainingAmount},userTfavar.singleTokenSecret,(err:any,token:any)=>{                         
                            //                     res.setHeader('X-Token', token);
                            //                     res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
                            //                        return res.send({status: 200,
                            //                                 message: "success with enabled TFA",
                            //                                 data:resultTFA.firstName,
                            //                                 tfaenabled:result.enableTfa
                            //                               });
                            //                     });
                            //               });
                            //       } else {
                            //           console.log(`ERROR: Invalid AUTH code`);
                            //           return res.send({
                            //               "status": 206,
                            //               "message": "Invalid Auth Code"
                            //           });
                            //       }
                            //    }
                        }
                        else {
                            return res.status(406).json({
                                "message": "Email Id is not Verify"
                            });
                        }
                    }
                    else {
                        return res.status(404).json({ message: "Mobile is not registered!" });
                    }
                });
            }
        });
    };
    CustomerController.prototype.tfaPostSetup = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                console.log("DEBUG: Received TFA setup request");
                console.log(authData.user);
                userTfavar.mobileNumber = authData.user;
                var secret_1 = speakeasy_1.default.generateSecret({
                    length: 10,
                    name: authData.user,
                    issuer: 'Felos v1.0',
                });
                var url = speakeasy_1.default.otpauthURL({
                    secret: secret_1.base32,
                    label: authData.user,
                    issuer: 'Felos v1.0',
                    encoding: 'base32'
                });
                qrcode_1.default.toDataURL(url, function (err, dataURL) {
                    userTfavar.tfa = {
                        secret: '',
                        tempSecret: secret_1.base32,
                        dataURL: dataURL,
                        tfaURL: url,
                        token: speakeasy_1.default.totp({
                            secret: secret_1.base32,
                            encoding: 'base32',
                        }),
                        remaining: (30 - Math.floor((new Date()).getTime() / 1000.0 % 30))
                    };
                    return res.json({
                        message: 'TFA Auth needs to be verified',
                        tempSecret: secret_1.base32,
                        dataURL: dataURL,
                        tfaURL: secret_1.otpauth_url,
                        token: speakeasy_1.default.totp({
                            secret: userTfavar.tfa.tempSecret,
                            encoding: 'base32',
                        }),
                        "remaining": (30 - Math.floor((new Date()).getTime() / 1000.0 % 30))
                    });
                });
            }
        });
    };
    CustomerController.prototype.tfaGetSetup = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                //  delete userTfavar.tfa.secret;
                res.json(userTfavar.tfa ? userTfavar.tfa : null);
            }
        });
    };
    CustomerController.prototype.tfaDeleteSetup = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                console.log("DEBUG: Received DELETE TFA request");
                delete userTfavar.tfa.secret;
                console.log('pahale thi tha object', userTfavar.tfa.tempSecret);
                //console.log(userTfavar.tfa);
                Customer.findOneAndUpdate({ mobileNumber: authData.user }, { $set: { enableTfa: 0 } }, { upsert: true }, function (err) {
                    if (err)
                        res.send(err);
                    return res.send({
                        status: 200,
                        message: "success"
                    });
                });
            }
        });
    };
    CustomerController.prototype.tfaverify = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                console.log("DEBUG: Received TFA Verify request");
                console.log(userTfavar.tfa.tempSecret);
                console.log(req.body.token);
                var isVerified = speakeasy_1.default.totp.verify({
                    secret: userTfavar.tfa.tempSecret,
                    encoding: 'base32',
                    token: req.body.token,
                    window: 0
                });
                console.log(isVerified);
                if (isVerified) {
                    console.log("DEBUG: TFA is verified to be enabled");
                    userTfavar.tfa.secret = userTfavar.tfa.tempSecret;
                    Customer.findOneAndUpdate({ mobileNumber: authData.user }, { $set: { enableTfa: 1 } }, { upsert: true }, function (err) {
                        if (err)
                            res.send(err);
                        return res.send({
                            "status": 200,
                            "message": "Two-factor Auth is enabled successfully"
                        });
                    });
                }
                else {
                    console.log("ERROR: TFA is verified to be wrong");
                    return res.send({
                        "status": 403,
                        "message": "Invalid Auth Code, verification failed. Please verify the system Date and Time"
                    });
                }
            }
        });
    };
    CustomerController.prototype.tfatokengenerate = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                console.log("DEBUG: Received TFA setup request");
                userTfavar.mobileNumber = authData.user;
                var secret = speakeasy_1.default.generateSecret({
                    length: 10,
                    name: authData.user,
                    issuer: 'NarenAuth v0.0',
                });
                userTfavar.tfa = {
                    secret: '',
                    tempSecret: secret.base32,
                    dataURL: '',
                    tfaURL: '',
                    token: speakeasy_1.default.totp({
                        secret: secret.base32,
                        encoding: 'base32',
                    }),
                    remaining: (30 - Math.floor((new Date()).getTime() / 1000.0 % 30))
                };
                return res.send({
                    message: 'TFA Auth needs to be verified',
                    "status": 200,
                    token: userTfavar.tfa.token,
                    remaining: userTfavar.tfa.remaining,
                    tempSecret: userTfavar.tfa.tempSecret
                });
            }
        });
    };
    CustomerController.prototype.emailVerification = function (req, res) {
        console.log(req.params.emailToken);
        req.header(req.params.emailToken);
        console.log(req.userToken);
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                res.send({ status: 200, message: "Email verification is successfully!!" });
            }
        });
    };
    CustomerController.prototype.AddBankAccount = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                var BankDetails = new Bank(req.body);
                if (BankDetails.bankIFSC == "" || BankDetails.bankIFSC == undefined) {
                    res.status(428).json({ message: "Required IFSC Code!!" });
                }
                else if (BankDetails.bankBranch == "" || BankDetails.bankBranch == undefined) {
                    res.status(428).json({ message: "Required Bank Branch !!" });
                }
                else if (BankDetails.bankName == "" || BankDetails.bankName == undefined) {
                    res.status(428).json({ message: "Required Bank Name !!" });
                }
                else if (BankDetails.bankMobileNumber == "" || BankDetails.bankMobileNumber == undefined) {
                    res.status(428).json({ message: "Required Bank Registerd Mobile Number !!" });
                }
                else if (BankDetails.bankAccount == "" || BankDetails.bankAccount == undefined) {
                    res.status(428).json({ message: "Required  Bank Account Number !!" });
                }
                else if (BankDetails.accountType == "" || BankDetails.accountType == undefined) {
                    res.status(428).json({ message: "Required  Bank Account Type !!" });
                }
                else {
                    BankDetails.customerId = authData._Id;
                    Bank.findOne({ account: BankDetails.account }, function (err, resultMatch) {
                        if (err)
                            res.send(err);
                        if (resultMatch) {
                            res.status(302).json({ message: "This Account Number is already Added!!" });
                        }
                        else {
                            BankDetails.account = BankDetails.bankAccount;
                            var encryptedString = cryptr.encrypt(BankDetails.bankAccount);
                            BankDetails.bankAccount = encryptedString;
                            BankDetails.save(function (err, saveAccount) {
                                if (err)
                                    res.send(err);
                                Customer.findOneAndUpdate({ mobileNumber: authData.user }, { $set: { accountStatus: 1 } }, { upsert: true }, function (err) {
                                    if (err)
                                        res.send(err);
                                    var bankAccount = cryptr.decrypt(BankDetails.bankAccount);
                                    var str = new Array(bankAccount.length - 4 + 1).join('x') + bankAccount.slice(-4);
                                    saveAccount.bankAccount = str;
                                    res.status(201).json({ message: "Account Update Successfully!!", saveAccount: saveAccount });
                                });
                            });
                        }
                    });
                }
            }
        });
    };
    CustomerController.prototype.AddCardAccount = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                var ATMDetails = new ATMCard(req.body);
                if (ATMDetails.cardType == "" || ATMDetails.cardType == undefined) {
                    res.status(428).json({ message: "Required ATM Card Type!!" });
                }
                else if (ATMDetails.cardholdername == "" || ATMDetails.cardholdername == undefined) {
                    res.status(428).json({ message: "Required cardholdername !!" });
                }
                else if (ATMDetails.cardNumber == "" || ATMDetails.cardNumber == undefined) {
                    res.status(428).json({ message: "Required Card Number!!" });
                }
                else if (ATMDetails.cardNumber.length != 16) {
                    res.status(412).json({ message: "Invalid Card Number!!" });
                }
                else if (ATMDetails.expiredMonth == "" || ATMDetails.expiredMonth == "0" || ATMDetails.expiredMonth == undefined) {
                    res.status(428).json({ message: "Required Expired ATM Month!!" });
                }
                else if (ATMDetails.expiredYear == "" || ATMDetails.expiredYear == "0" || ATMDetails.expiredYear == undefined) {
                    res.status(428).json({ message: "Required Expired ATM Year!!" });
                }
                else {
                    ATMDetails.customerId = authData._Id;
                    ATMCard.findOne({ card: ATMDetails.cardNumber }, function (err, resultMatch) {
                        if (err)
                            res.send(err);
                        if (resultMatch) {
                            res.status(302).json({ message: "This Card Number is already Added!!" });
                        }
                        else {
                            ATMDetails.card = ATMDetails.cardNumber;
                            var encryptedString = cryptr.encrypt(ATMDetails.cardNumber);
                            ATMDetails.cardNumber = encryptedString;
                            //console.log(ATMDetails);
                            ATMDetails.save(function (err, saveCard) {
                                if (err)
                                    res.send(err);
                                // console.log(saveCard)
                                saveCard.cardNumber = cryptr.decrypt(ATMDetails.cardNumber);
                                var str = new Array(ATMDetails.card.length - 4 + 1).join('x') + ATMDetails.card.slice(-4);
                                saveCard.cardNumber = str;
                                res.status(201).json({ message: "Account Update Successfully!!", saveCard: saveCard });
                            });
                        }
                    });
                }
            }
        });
    };
    CustomerController.prototype.AtmCardList = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.status(403).json({ message: "Invalid Token please enter your valid token" });
            else {
                console.log(authData._Id);
                ATMCard.find({ customerId: authData._Id }, function (err, cardList) {
                    if (err)
                        res.send(err);
                    if (cardList) {
                        for (var x = 0; x < cardList.length; x++) {
                            var decard = cryptr.decrypt(cardList[x].cardNumber);
                            var str = new Array(decard.length - 4 + 1).join('x') + decard.slice(-4);
                            cardList[x].cardNumber = str;
                        }
                        res.status(200).json({ message: "All Card list!!", cardList: cardList });
                    }
                    else {
                        res.status(200).json({ message: "Record is not found!!" });
                    }
                });
            }
        });
    };
    CustomerController.prototype.AddKYCDocument = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                var KYCDetails = new KYCDocument(req.body);
                if (KYCDetails.kycDocumentName == "" || KYCDetails.kycDocumentName == undefined) {
                    res.send({ status: 200, message: "Required kyc Document Name!!" });
                }
                else if (req.file == undefined) {
                    res.send({ status: 500, message: "Internal Error! Image fieldname missing parameter" });
                }
                else if (req.file.filename == '') {
                    res.status(401).send({ success: false, message: "kyc is required!" });
                }
                else {
                    KYCDetails.customerId = authData._Id;
                    KYCDetails.documentPath = req.file.filename;
                    KYCDetails.save(function (err, eKycData) {
                        if (err)
                            res.send(err);
                        Customer.findOneAndUpdate({ mobileNumber: authData.user }, { $set: { kycStatus: 1 } }, { upsert: true }, function (err) {
                            if (err)
                                res.send(err);
                            res.send({ status: 200, message: "KYC Update Successfully!!", eKycData: eKycData });
                        });
                    });
                }
            }
        });
    };
    CustomerController.prototype.AddFundInWallet = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                var AddfundDetails = new AddFund(req.body);
                var customerTranHistory = new CustomerTransaction(req.body);
                if (AddfundDetails.amount == 0 || AddfundDetails.amount == undefined) {
                    res.send({ status: 200, message: "Required amount!!" });
                }
                else if (AddfundDetails.amount <= 24) {
                    res.send({ status: 200, message: "Required amount minmum AED.25!!" });
                }
                else {
                    AddfundDetails.customerId = authData._Id;
                    AddfundDetails.felosTransationId = "felos" + Math.random().toString(36).slice(2);
                    AddfundDetails.fundType = "Cr";
                    AddfundDetails.fundstatus = 1;
                    AddfundDetails.accountNumber = "35264564125";
                    AddfundDetails.bankTransactionId = Math.random().toString(36).slice(3);
                    AddfundDetails.currencyType = "INR";
                    AddfundDetails.fundlocation = "Gurugram Hariyana SikandarPur Metro";
                    AddfundDetails.funddescription = "Abc";
                    // res.send({status: 200, message: "Successfully!!", AddfundDetails});
                    customerTranHistory.customerId = authData._Id;
                    customerTranHistory.felosTransationId = "felos" + Math.random().toString(36).slice(2);
                    customerTranHistory.transationType = "Added Fund!!";
                    customerTranHistory.toName = authData.name;
                    customerTranHistory.toURL = authData.url;
                    customerTranHistory.fundFromMobile = "NA";
                    customerTranHistory.fundToMobile = authData.user;
                    customerTranHistory.location = "Gurugram Hariyana SikandarPur Metro";
                    customerTranHistory.transactionstatus = 1;
                    customerTranHistory.amount = AddfundDetails.amount;
                    AddfundDetails.save(function (err, eKycData) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            Customer.findOne({ mobileNumber: authData.user }, function (err, checkblance) {
                                if (err)
                                    res.send(err);
                                //Add New Balance
                                var balance = (checkblance.remainingAmount + AddfundDetails.amount);
                                // balance
                                Customer.findOneAndUpdate({ mobileNumber: authData.user }, { $set: { remainingAmount: balance } }, { upsert: true }, function (err) {
                                    if (err)
                                        res.send(err);
                                    customerTranHistory.save(function (err, History) {
                                        if (err) {
                                            res.send(err);
                                        }
                                        else {
                                            Customer.findOne({ mobileNumber: authData.user }, function (err, checkblancedata) {
                                                if (err)
                                                    res.send(err);
                                                res.send({ status: 200, message: "Added Fund Successfully!!", checkblancedata: checkblancedata });
                                            });
                                        }
                                    });
                                });
                            });
                        }
                    });
                }
            }
        });
    };
    CustomerController.prototype.UpdateCustomer = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                var customerDetails = new Customer(req.body);
                if (customerDetails.lastName === "" || customerDetails.lastName === undefined) {
                    res.json({ message: "Enter Your Last Name!", error: true, success: false });
                }
                else if (customerDetails.dateOfBirth === "" || customerDetails.dateOfBirth === undefined) {
                    res.json({ message: "Enter Your Date Of Birth!", error: true, success: false });
                }
                else if (customerDetails.fromCounteryType === "" || customerDetails.fromCounteryType === undefined) {
                    res.json({ message: "Enter Your From Country Type!", error: true, success: false });
                }
                else if (customerDetails.country === "" || customerDetails.country === undefined) {
                    res.json({ message: "Enter Your country!", error: true, success: false });
                }
                else if (customerDetails.localityAddress === "" || customerDetails.localityAddress === undefined) {
                    res.json({ message: "Enter Your locality Address!", error: true, success: false });
                }
                else {
                    Customer.findOneAndUpdate({ mobileNumber: authData.user }, { '$set': { lastName: customerDetails.lastName, dateOfBirth: customerDetails.dateOfBirth, fromCounteryType: customerDetails.fromCounteryType,
                            country: customerDetails.country, localityAddress: customerDetails.localityAddress
                        } }, { upsert: true }, function (err) {
                        if (err)
                            res.send(err);
                        Customer.findOne({ mobileNumber: authData.user }, function (err, Customerdata) {
                            if (err)
                                res.send(err);
                            res.send({ status: 200, message: "Update Successfully!!", Customerdata: Customerdata });
                        });
                    });
                }
            }
        });
    };
    CustomerController.prototype.UpdateCustomerProfile = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                console.log(req.file);
                var customerProfile = new Customer(req.body);
                if (req.file == undefined) {
                    res.send({ status: 500, message: "Internal Error! Image fieldname missing parameter" });
                }
                else if (req.file.filename == '') {
                    res.status(401).send({ success: false, message: "kyc is required!" });
                }
                else {
                    customerProfile.profilePic = req.file.filename;
                    Customer.findOneAndUpdate({ mobileNumber: authData.user }, { '$set': { profilePic: customerProfile.profilePic } }, { upsert: true }, function (err) {
                        if (err)
                            res.send(err);
                        Customer.findOne({ mobileNumber: authData.user }, function (err, Profiledata) {
                            if (err)
                                res.send(err);
                            res.send({ status: 200, message: "Added Fund Successfully!!", Profiledata: Profiledata });
                        });
                    });
                }
            }
        });
    };
    CustomerController.prototype.changePassword = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                var CustomerChenge_1 = new Customer(req.body);
                if (req.body.oldPassword == "" || req.body.oldPassword == undefined) {
                    res.send({ status: 428, message: "Required Old Password!" });
                }
                else if (CustomerChenge_1.userPassword == "" || CustomerChenge_1.userPassword == undefined) {
                    res.send({ status: 428, message: "Required New Password!" });
                }
                else if (CustomerChenge_1.userPassword.length <= 6) {
                    res.json({ message: "Password is too sort!", error: true, success: false });
                }
                else if (req.body.rePassword == '' || req.body.rePassword == undefined) {
                    res.send({ status: 428, message: "Required Re-Password!" });
                }
                else if (req.body.rePassword != CustomerChenge_1.userPassword) {
                    res.send({ status: 500, message: "Password dose not match!" });
                }
                else {
                    Customer.findOne({ mobileNumber: authData.user }, function (err, result) {
                        if (err)
                            res.send(err);
                        if (result) {
                            bcryptjs_1.default.compare(req.body.oldPassword, result.userPassword, function (err, isMatch) {
                                if (err)
                                    throw err;
                                if (isMatch) {
                                    bcryptjs_1.default.genSalt(10, function (err, salt) {
                                        if (err)
                                            res.send(err);
                                        bcryptjs_1.default.hash(CustomerChenge_1.userPassword, salt, function (err, hash) {
                                            if (err)
                                                res.send(err);
                                            CustomerChenge_1.userPassword = hash;
                                            Customer.findOneAndUpdate({ mobileNumber: authData.user }, { '$set': { userPassword: CustomerChenge_1.userPassword } }, { upsert: true }, function (err) {
                                                if (err)
                                                    res.send(err);
                                                res.send({ status: 200, message: "Password change successfully!" });
                                            });
                                        });
                                    });
                                }
                                else {
                                    res.send({
                                        "status": 403,
                                        "message": "Old Password is wrong dose not match!"
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    };
    CustomerController.prototype.Wallet2Wallet = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                var customerTranHistory = new CustomerTransaction(req.body);
                if (customerTranHistory.fundToMobile == "" || customerTranHistory.fundToMobile == undefined) {
                    res.send({ status: 428, message: "Required Mobile Number Send to Money!" });
                }
                else if (customerTranHistory.amount == 0 || customerTranHistory.amount == undefined) {
                    res.send({ status: 428, message: "Required amount!!" });
                }
                else if (customerTranHistory.amount <= 1) {
                    res.send({ status: 200, message: "You paid amount minmum AED.1.00 !!" });
                }
                else {
                    var transaction_1 = Math.random().toString(36).slice(2);
                    Customer.findOne({ mobileNumber: customerTranHistory.fundToMobile }, function (err, isMatch) {
                        if (err)
                            res.send(err);
                        // console.log(isMatch);
                        if (isMatch) {
                            Customer.findOne({ mobileNumber: authData.user }, function (err, isMatchbalance) {
                                if (err)
                                    res.send(err);
                                var totalbalnce = isMatchbalance.remainingAmount;
                                if (customerTranHistory.amount >= totalbalnce) {
                                    res.send({ status: 200, message: "Your amount balance is not suffiecient!!", remaingBalance: totalbalnce });
                                }
                                else {
                                    var creditnewbalance_1 = (isMatch.remainingAmount + customerTranHistory.amount);
                                    var debitnewbalance = (totalbalnce - customerTranHistory.amount);
                                    Customer.findOneAndUpdate({ mobileNumber: authData.user }, { $set: { remainingAmount: debitnewbalance } }, { upsert: true }, function (err) {
                                        if (err)
                                            res.send(err);
                                        Customer.findOneAndUpdate({ mobileNumber: customerTranHistory.fundToMobile }, { $set: { remainingAmount: creditnewbalance_1 } }, { upsert: true }, function (err) {
                                            if (err)
                                                res.send(err);
                                            Customer.findOne({ mobileNumber: authData.user }, function (err, checkblancenewdata) {
                                                if (err)
                                                    res.send(err);
                                                customerTranHistory.customerId = authData._Id;
                                                customerTranHistory.felosTransationId = "felos" + transaction_1;
                                                customerTranHistory.transationType = "Wallet2Wallet";
                                                customerTranHistory.toName = isMatch.firstName;
                                                customerTranHistory.fundFromMobile = authData.user;
                                                customerTranHistory.toURL = isMatch.profilePic;
                                                customerTranHistory.location = "Gurugram Hariyana SikandarPur Metro";
                                                customerTranHistory.transactionstatus = 1;
                                                customerTranHistory.save(function (err, History) {
                                                    if (err) {
                                                        res.send(err);
                                                    }
                                                    else {
                                                        Customer.findOne({ mobileNumber: customerTranHistory.fundToMobile }, function (err, Todata) {
                                                            if (err)
                                                                res.send(err);
                                                            res.send({ status: 200, message: "Payment Successfully Transfer!", remainingAmount: checkblancenewdata.remainingAmount, toname: Todata.firstName, tomobile: Todata.mobileNumber });
                                                        });
                                                    }
                                                });
                                            });
                                        });
                                    });
                                }
                            });
                        }
                        else {
                            res.send({ status: 401, message: "Reciver is not valid or registered!!" });
                        }
                    });
                }
            }
        });
    };
    CustomerController.prototype.genQrCodeAccount = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                //Customer.findOne({mobileNumber:authData.user},(err,resultcustomer:ICustomer)=>{
                //  if(err) res.status(404).send(err);         
                // if(resultcustomer){
                var qrcode_2 = Math.random().toString(36).slice(2);
                res.setHeader('X-qrcodekey', "felos" + qrcode_2);
                res.setHeader('X-site', 'felos');
                var r = Math.random().toString(36).substring(3);
                var segs = [
                    { data: r.toUpperCase(), mode: 'alphanumeric' },
                    { data: authData.user, mode: 'numeric' }
                ];
                qrcode_1.default.toDataURL(segs, { errorCorrectionLevel: 'H', version: 2 }, function (err, data_url) {
                    if (err)
                        res.status(509).send(err);
                    res.status(201).json({
                        message: 'Generate Qrcode Successfully',
                        data_url: data_url,
                        mobile: authData.user,
                        qrcodekey: qrcode_2
                    });
                });
                // });
                // }
                // })
            }
        });
    };
    CustomerController.prototype.verifyQrCodeAccount = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.status(428).json({ flag: 0, message: "Invalid Token please enter your valid token" });
            else {
                var customeraccount_1 = new Customer(req.body);
                if (customeraccount_1.mobileNumber == "" || customeraccount_1.mobileNumber == undefined) {
                    res.status(428).json({ flag: 0, message: 'mobile no. is required!!' });
                }
                else if (req.headers['x-site'] == "" || req.headers['x-site'] == undefined) {
                    res.status(428).json({ flag: 0, message: 'missing parameter required1!!' });
                }
                else {
                    if (req.headers['x-site'] != undefined) {
                        if (req.headers['x-site'] == "felos") {
                            console.log(customeraccount_1.mobileNumber);
                            console.log(authData.user);
                            if (customeraccount_1.mobileNumber == authData.user) {
                                res.status(401).json({ flag: 0, message: "Sorry, It seem like you are scaning your own QR code " });
                            }
                            else {
                                Customer.findOne({ mobileNumber: authData.user }, function (err, authDetail) {
                                    if (err)
                                        res.status(500).json({ flag: 0, message: 'Internal error' });
                                    if (authDetail) {
                                        Customer.findOne({ mobileNumber: customeraccount_1.mobileNumber }, function (err, customerDetail) {
                                            if (err)
                                                res.status(500).json({ flag: 0, message: 'Internal error' });
                                            var listtransaction = [];
                                            CustomerTransaction.find({ fundFromMobile: authData.user, fundToMobile: customeraccount_1.mobileNumber }, function (err, singlehistoryData) {
                                                if (err) {
                                                    res.send(err);
                                                }
                                                else {
                                                    for (var i = 0; i < singlehistoryData.length; i++) {
                                                        listtransaction.push({ fromtransaction: singlehistoryData[i].fundFromMobile, name: singlehistoryData[i].toName, toURL: singlehistoryData[i].toURL, fromdeposit: "Credit", transactionId: singlehistoryData[i].felosTransationId, tofund: singlehistoryData[i].fundToMobile, transactiondate: moment(singlehistoryData[i].createDate).format('L'), transactiontime: moment(singlehistoryData[i].createDate).format('LT'),
                                                            transactionAmount: singlehistoryData[i].amount, transactionstatus: singlehistoryData[i].transactionstatus, transationType: singlehistoryData[i].transationType, transactionmonth: moment(singlehistoryData[i].createDate).format('MMM YYYY'), transactionyear: moment(singlehistoryData[i].createDate).format('YYYY') });
                                                    }
                                                    var grouping = _.groupBy(listtransaction, function (element) {
                                                        return element.transactiondate;
                                                    });
                                                    var TranasctionHistory = _.map(grouping, function (items, date) { return ({
                                                        filter: date,
                                                        data: items
                                                    }); });
                                                    if (listtransaction.length > 0) {
                                                        res.status(200).json({ message: 'Sucessfully!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistory: TranasctionHistory });
                                                    }
                                                    else {
                                                        res.status(200).json({ message: 'No Transaction History!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistory: TranasctionHistory });
                                                    }
                                                }
                                            });
                                        });
                                    }
                                    else {
                                        res.status(200).json({ message: 'Record not found!' });
                                    }
                                });
                            }
                        }
                        else {
                            res.status(401).json({ flag: 0, message: 'invalid scan1' });
                        }
                    }
                    else {
                        res.status(401).json({ flag: 0, message: 'invalid scan2' });
                    }
                }
            }
        });
    };
    CustomerController.prototype.customerAlllist = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.status(428).json({ flag: 0, message: "Invalid Token please enter your valid token" });
            else {
                Customer.find({}, function (err, customer) {
                    if (err)
                        res.status(500).json({ flag: 0, message: 'Internal error' });
                    if (customer) {
                        var dataCustomer = [];
                        for (var x = 0; x < customer.length; x++) {
                            dataCustomer.push({ name: customer[x].firstName, mobile: customer[x].mobileNumber, profileimg: customer[x].profilePic });
                        }
                        res.status(200).send({ message: 'Sucessfully!', customerData: dataCustomer });
                    }
                    else {
                        res.status(200).json({ message: 'Record not found!' });
                    }
                });
            }
        });
    };
    CustomerController.prototype.customersingleDetail = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.status(428).json({ flag: 0, message: "Invalid Token please enter your valid token" });
            else {
                var customeraccount_2 = new Customer(req.body);
                if (customeraccount_2.mobileNumber == '' && customeraccount_2.mobileNumber == undefined) {
                    res.status(428).json({ message: 'mobile number is required!' });
                }
                else {
                    Customer.findOne({ mobileNumber: authData.user }, function (err, authDetail) {
                        if (err)
                            res.status(500).json({ flag: 0, message: 'Internal error' });
                        if (authDetail) {
                            Customer.findOne({ mobileNumber: customeraccount_2.mobileNumber }, function (err, customerDetail) {
                                if (err)
                                    res.status(500).json({ flag: 0, message: 'Internal error' });
                                var listtransaction = [];
                                CustomerTransaction.find({ fundFromMobile: authData.user, fundToMobile: customeraccount_2.mobileNumber }, function (err, singlehistoryData) {
                                    if (err) {
                                        res.send(err);
                                    }
                                    else {
                                        for (var i = 0; i < singlehistoryData.length; i++) {
                                            listtransaction.push({ fromtransaction: singlehistoryData[i].fundFromMobile, name: singlehistoryData[i].toName, toURL: singlehistoryData[i].toURL, fromdeposit: "Credit", transactionId: singlehistoryData[i].felosTransationId, tofund: singlehistoryData[i].fundToMobile, transactiondate: moment(singlehistoryData[i].createDate).format('L'), transactiontime: moment(singlehistoryData[i].createDate).format('LT'),
                                                transactionAmount: singlehistoryData[i].amount, transactionstatus: singlehistoryData[i].transactionstatus, transationType: singlehistoryData[i].transationType, transactionmonth: moment(singlehistoryData[i].createDate).format('MMM YYYY'), transactionyear: moment(singlehistoryData[i].createDate).format('YYYY') });
                                        }
                                        var grouping = _.groupBy(listtransaction, function (element) {
                                            return element.transactiondate;
                                        });
                                        var TranasctionHistory = _.map(grouping, function (items, date) { return ({
                                            filter: date,
                                            data: items
                                        }); });
                                        if (listtransaction.length > 0) {
                                            res.status(200).json({ message: 'Sucessfully!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistory: TranasctionHistory });
                                        }
                                        else {
                                            res.status(200).json({ message: 'No Transaction History!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistory: TranasctionHistory });
                                        }
                                    }
                                });
                            });
                        }
                        else {
                            res.status(200).json({ message: 'Record not found!' });
                        }
                    });
                }
            }
        });
    };
    CustomerController.prototype.CustomerTransactionHistory = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                var listtransaction_1 = [];
                CustomerTransaction.find({ fundFromMobile: authData.user }, function (err, historyData) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        if (historyData) {
                            for (var x = 0; x < historyData.length; x++) {
                                listtransaction_1.push({ fromtransaction: historyData[x].fundFromMobile, fromdeposit: historyData[x].fromdepositeType, transactionId: historyData[x].felosTransationId, tofund: historyData[x].fundToMobile, transactiondate: historyData[x].createDate,
                                    transactionAmount: historyData[x].amount, transactionstatus: historyData[x].transactionstatus, transationType: historyData[x].transationType });
                            }
                        }
                        AddFund.find({ customerId: authData._Id }, function (err, historycrData) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                if (historycrData) {
                                    for (var xx = 0; xx < historycrData.length; xx++) {
                                        listtransaction_1.push({ fromtransaction: historycrData[xx].accountNumber, fromdeposit: historycrData[xx].fundType, transactionId: historycrData[xx].felosTransationId, tofund: authData.user, transactiondate: historycrData[xx].createDate,
                                            transactionAmount: historycrData[xx].amount, transactionstatus: historycrData[xx].fundstatus,
                                            transationType: "Add Fund from Bank" });
                                    }
                                }
                                if (listtransaction_1.length > 0) {
                                    res.status(200).json({ message: "Successfully created!", error: false, success: true, listtransaction: listtransaction_1 });
                                }
                                else {
                                    res.status(200).json({ message: "No Tranasction history!", error: false, success: true });
                                }
                            }
                        });
                    }
                });
            }
        });
    };
    CustomerController.prototype.customerTransaction = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.send({ status: 403, message: "Invalid Token please enter your valid token" });
            else {
                if (req.body.tomobileNo == '' || req.body.tomobileNo == undefined) {
                    res.status(428).json({ message: 'tomobile number is required!' });
                }
                else {
                    var listtransaction_2 = [];
                    CustomerTransaction.find({ fundFromMobile: authData.user, fundToMobile: req.body.tomobileNo }, function (err, singlehistoryData) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            for (var i = 0; i < singlehistoryData.length; i++) {
                                listtransaction_2.push({ fromtransaction: singlehistoryData[i].fundFromMobile, fromdeposit: singlehistoryData[i].fromdepositeType, transactionId: singlehistoryData[i].felosTransationId, tofund: singlehistoryData[i].fundToMobile, transactiondate: singlehistoryData[i].createDate,
                                    transactionAmount: singlehistoryData[i].amount, transactionstatus: singlehistoryData[i].transactionstatus, transationType: singlehistoryData[i].transationType });
                                // res.status(200).json({message:"No Tranasction history!",singlehistoryData});
                            }
                            if (listtransaction_2.length > 0) {
                                res.status(200).json({ message: "Successfully created!", error: false, success: true, listtransaction: listtransaction_2 });
                            }
                            else {
                                res.status(200).json({ message: "No Tranasction history!", error: false, success: true });
                            }
                        }
                    });
                }
            }
        });
    };
    CustomerController.prototype.customerDetail = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.status(428).json({ flag: 0, message: "Invalid Token please enter your valid token" });
            else {
                var pageNo = parseInt(req.body.pageNo) || 1;
                Customer.findOne({ mobileNumber: authData.user }, function (err, authDetail) {
                    if (err)
                        res.status(500).json({ flag: 0, message: 'Internal error' });
                    if (authDetail) {
                        Customer.findOne({ mobileNumber: authData.user }, function (err, customerDetail) {
                            if (err)
                                res.status(500).json({ flag: 0, message: 'Internal error' });
                            var listtransaction = [];
                            CustomerTransaction.find({ $or: [{ 'fundToMobile': authData.user }, { 'fundFromMobile': authData.user }] }, null, { sort: { 'createDate': -1 } }, function (err, singlehistoryData) {
                                if (err) {
                                    res.send(err);
                                }
                                else {
                                    for (var i = 0; i < singlehistoryData.length; i++) {
                                        if (authData.user === singlehistoryData[i].fundToMobile) {
                                            listtransaction.push({ fromtransaction: singlehistoryData[i].fundFromMobile, name: singlehistoryData[i].toName, toURL: singlehistoryData[i].toURL, fromdeposit: "Credit", transactionId: singlehistoryData[i].felosTransationId, tofund: singlehistoryData[i].fundToMobile, transactiondate: moment(singlehistoryData[i].createDate).format('L'), transactiontime: moment(singlehistoryData[i].createDate).format('LT'),
                                                transactionAmount: singlehistoryData[i].amount, transactionstatus: singlehistoryData[i].transactionstatus, transationType: singlehistoryData[i].transationType, transactionmonth: moment(singlehistoryData[i].createDate).format('MMM YYYY'), transactionyear: moment(singlehistoryData[i].createDate).format('YYYY') });
                                        }
                                        else {
                                            listtransaction.push({ fromtransaction: singlehistoryData[i].fundFromMobile, name: singlehistoryData[i].toName, toURL: singlehistoryData[i].toURL, fromdeposit: "Debit", transactionId: singlehistoryData[i].felosTransationId, tofund: singlehistoryData[i].fundToMobile, transactiondate: moment(singlehistoryData[i].createDate).format('L'), transactiontime: moment(singlehistoryData[i].createDate).format('LT'),
                                                transactionAmount: singlehistoryData[i].amount, transactionstatus: singlehistoryData[i].transactionstatus, transationType: singlehistoryData[i].transationType, transactionmonth: moment(singlehistoryData[i].createDate).format('MMM YYYY'), transactionyear: moment(singlehistoryData[i].createDate).format('YYYY') });
                                        }
                                    }
                                    //filter day
                                    if (req.body.filter == '' || req.body.filter == 'day' || req.body.filter == undefined) {
                                        var grouping = _.groupBy(listtransaction, function (element) {
                                            return element.transactiondate;
                                        });
                                        var TranasctionHistory = _.map(grouping, function (items, date) { return ({
                                            filter: date,
                                            data: items
                                        }); });
                                        if (listtransaction.length > 0) {
                                            res.status(200).json({ message: 'Sucessfully!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistory: TranasctionHistory });
                                        }
                                        else {
                                            res.status(200).json({ message: 'No Transaction History!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistory: TranasctionHistory });
                                        }
                                    }
                                    //filter month
                                    else if (req.body.filter == 'month') {
                                        var helper = {};
                                        var result = listtransaction.reduce(function (r, o, indx) {
                                            var key = o.name + '-' + o.transactionmonth;
                                            if (!helper[key]) {
                                                if (o.tofund !== authData.user) {
                                                    helper[key] = Object.assign({}, o); // create a copy of o
                                                    r.push(helper[key]);
                                                    helper[key].count = 1;
                                                    if (listtransaction[indx].fromdeposit == "Credit" && helper[key].transactionmonth == listtransaction[indx].transactionmonth && listtransaction[indx].transationType === "Wallet2Wallet") {
                                                        helper[key].totalCreditAmount = (parseInt(listtransaction[indx].transactionAmount));
                                                        helper[key].totalDebitAmount = 0;
                                                    }
                                                    if (listtransaction[indx].fromdeposit == "Debit" && helper[key].transactionmonth == listtransaction[indx].transactionmonth) {
                                                        helper[key].totalCreditAmount = 0;
                                                        helper[key].totalDebitAmount = (parseInt(listtransaction[indx].transactionAmount));
                                                    }
                                                }
                                            }
                                            else {
                                                if (helper[key].tofund !== authData.user) {
                                                    helper[key].count = (helper[key].count || 0) + 1;
                                                    if (listtransaction[indx].fromdeposit == "Credit" && helper[key].transactionmonth == listtransaction[indx].transactionmonth && listtransaction[indx].transationType === "Wallet2Wallet") {
                                                        helper[key].totalCreditAmount += (parseInt(listtransaction[indx].transactionAmount));
                                                        helper[key].totalDebitAmount += (parseInt(helper[key].totalDebitAmount));
                                                    }
                                                    if (listtransaction[indx].fromdeposit == "Debit" && helper[key].transactionmonth == listtransaction[indx].transactionmonth) {
                                                        helper[key].totalCreditAmount += (parseInt(helper[key].totalCreditAmount));
                                                        helper[key].totalDebitAmount += (parseInt(listtransaction[indx].transactionAmount));
                                                    }
                                                }
                                            }
                                            return r;
                                        }, []);
                                        var grouping = _.groupBy(result, function (element) {
                                            return element.transactionmonth;
                                        });
                                        var TranasctionHistory = _.map(grouping, function (items, month) { return ({
                                            filter: month,
                                            data: items
                                        }); });
                                        if (listtransaction.length > 0) {
                                            res.status(200).json({ message: 'Sucessfully!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistory: TranasctionHistory });
                                        }
                                        else {
                                            res.status(200).json({ message: 'No Transaction History!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistory: TranasctionHistory });
                                        }
                                    }
                                    //filter year
                                    else if (req.body.filter == 'year') {
                                        var helper = {};
                                        var result = listtransaction.reduce(function (r, o, indx) {
                                            var key = o.name + '-' + o.transactionyear;
                                            //  if (o.tofund !== authData.user) {
                                            if (!helper[key]) {
                                                if (o.tofund !== authData.user) {
                                                    helper[key] = Object.assign({}, o); // create a copy of o
                                                    r.push(helper[key]);
                                                    helper[key].count = 1;
                                                    if (listtransaction[indx].fromdeposit == "Credit" && helper[key].transactionmonth == listtransaction[indx].transactionmonth && listtransaction[indx].transationType === "Wallet2Wallet") {
                                                        helper[key].totalCreditAmount = (parseInt(listtransaction[indx].transactionAmount));
                                                        helper[key].totalDebitAmount = 0;
                                                    }
                                                    if (listtransaction[indx].fromdeposit == "Debit" && helper[key].transactionmonth == listtransaction[indx].transactionmonth) {
                                                        helper[key].totalCreditAmount = 0;
                                                        helper[key].totalDebitAmount = (parseInt(listtransaction[indx].transactionAmount));
                                                    }
                                                }
                                            }
                                            else {
                                                if (helper[key].tofund !== authData.user) {
                                                    helper[key].count = (helper[key].count || 0) + 1;
                                                    if (listtransaction[indx].fromdeposit == "Credit" && helper[key].transactionmonth == listtransaction[indx].transactionmonth && listtransaction[indx].transationType === "Wallet2Wallet") {
                                                        helper[key].totalCreditAmount += (parseInt(listtransaction[indx].transactionAmount));
                                                        helper[key].totalDebitAmount += (parseInt(helper[key].totalDebitAmount));
                                                    }
                                                    if (listtransaction[indx].fromdeposit == "Debit" && helper[key].transactionmonth == listtransaction[indx].transactionmonth) {
                                                        helper[key].totalCreditAmount += (parseInt(helper[key].totalCreditAmount));
                                                        helper[key].totalDebitAmount += (parseInt(listtransaction[indx].transactionAmount));
                                                    }
                                                }
                                            }
                                            return r;
                                        }, []);
                                        var grouping = _.groupBy(result, function (element) {
                                            return element.transactionyear;
                                        });
                                        var TranasctionHistory = _.map(grouping, function (items, year) { return ({
                                            filter: year,
                                            data: items
                                        }); });
                                        if (listtransaction.length > 0) {
                                            res.status(200).json({ message: 'Sucessfully!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistory: TranasctionHistory });
                                        }
                                        else {
                                            res.status(200).json({ message: 'No Transaction History!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistory: TranasctionHistory });
                                        }
                                    }
                                }
                            }).skip(10 * (pageNo - 1)).limit(10);
                        });
                    }
                    else {
                        res.status(200).json({ message: 'Record not found!' });
                    }
                });
                //}
            }
        });
    };
    CustomerController.prototype.recentUser = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.status(428).json({ flag: 0, message: "Invalid Token please enter your valid token" });
            else {
                Customer.findOne({ mobileNumber: authData.user }, function (err, authDetail) {
                    if (err)
                        res.status(500).json({ flag: 0, message: 'Internal error' });
                    if (authDetail) {
                        Customer.findOne({ mobileNumber: authData.user }, function (err, customerDetail) {
                            if (err)
                                res.status(500).json({ flag: 0, message: 'Internal error' });
                            var listtransaction = [];
                            CustomerTransaction.find({ $or: [{ 'fundToMobile': authData.user }, { 'fundFromMobile': authData.user }] }, null, { sort: { 'createDate': -1 } }, function (err, singlehistoryData) {
                                if (err) {
                                    res.send(err);
                                }
                                else {
                                    for (var i = 0; i < singlehistoryData.length; i++) {
                                        if (singlehistoryData[i].fundFromMobile != "NA") {
                                            listtransaction.push({ fromtransaction: singlehistoryData[i].fundFromMobile, name: singlehistoryData[i].toName, toURL: singlehistoryData[i].toURL, fromdeposit: "Credit", transactionId: singlehistoryData[i].felosTransationId, tofund: singlehistoryData[i].fundToMobile, transactiondate: moment(singlehistoryData[i].createDate).format('L'), transactiontime: moment(singlehistoryData[i].createDate).format('LT'),
                                                transactionAmount: singlehistoryData[i].amount, transactionstatus: singlehistoryData[i].transactionstatus, transationType: singlehistoryData[i].transationType, transactionmonth: moment(singlehistoryData[i].createDate).format('MMM YYYY'), transactionyear: moment(singlehistoryData[i].createDate).format('YYYY') });
                                        }
                                    }
                                    var grouping = _.groupBy(listtransaction, function (element) {
                                        return element.tofund || element.fromtransaction;
                                    });
                                    var TranasctionHistory = _.map(grouping, function (items, name) { return ({
                                        "fromtransaction": items[0].fromtransaction,
                                        "name": items[0].name,
                                        "toURL": items[0].toURL,
                                        "fromdeposit": items[0].fromdeposit,
                                        "transactionId": items[0].transactionId,
                                        "tofund": items[0].tofund,
                                        "transactiondate": items[0].transactiondate,
                                        "transactiontime": items[0].transactiontime,
                                        "transactionAmount": items[0].transactionAmount,
                                        "transactionstatus": items[0].transactionstatus,
                                        "transationType": items[0].transationType,
                                        "transactionmonth": items[0].transactionmonth,
                                        "transactionyear": items[0].transactionyear,
                                        "count": items.length,
                                    }); });
                                    var RecentUser = [];
                                    for (var x = 0; x < TranasctionHistory.length; x++) {
                                        if (TranasctionHistory[x].tofund == authData.user) {
                                            RecentUser.push({ tofund: TranasctionHistory[x].fromtransaction, transactiontime: TranasctionHistory[x].transactiontime, transactiondate: TranasctionHistory[x].transactiondate });
                                        }
                                        else {
                                            RecentUser.push({ tofund: TranasctionHistory[x].tofund, transactiontime: TranasctionHistory[x].transactiontime, transactiondate: TranasctionHistory[x].transactiondate });
                                        }
                                    }
                                    var grouping1 = _.groupBy(RecentUser, function (element) {
                                        return element.tofund;
                                    });
                                    var TranasctionHistory1 = _.map(grouping1, function (items, name) {
                                        return items[0].tofund;
                                    });
                                    var finalRecent = [];
                                    Customer.find({ mobileNumber: { "$in": TranasctionHistory1 } }, function (err, customerList) {
                                        if (err)
                                            throw err;
                                        if (customerList.length > 0) {
                                            for (var x = 0; x < customerList.length; x++) {
                                                finalRecent.push({ Mobile: customerList[x].mobileNumber, name: customerList[x].firstName, image: customerList[x].profilePic });
                                            }
                                            res.status(200).json({ message: 'Sucessfully!', data: finalRecent.reverse() });
                                        }
                                        else {
                                            res.status(200).json({ message: 'Sucessfully!', data: "No Recent User" });
                                        }
                                    });
                                }
                            }).limit(10);
                        });
                    }
                    else {
                        res.status(200).json({ message: 'Record not found!' });
                    }
                });
            }
        });
    };
    CustomerController.prototype.graphData = function (req, res) {
        jsonwebtoken_1.default.verify(req.userToken, userTfavar.singleTokenSecret, function (err, authData) {
            if (err)
                res.status(428).json({ flag: 0, message: "Invalid Token please enter your valid token" });
            else {
                Customer.findOne({ mobileNumber: authData.user }, function (err, authDetail) {
                    if (err)
                        res.status(500).json({ flag: 0, message: 'Internal error' });
                    if (authDetail) {
                        Customer.findOne({ mobileNumber: authData.user }, function (err, customerDetail) {
                            if (err)
                                res.status(500).json({ flag: 0, message: 'Internal error' });
                            var listtransaction = [];
                            CustomerTransaction.find({ $or: [{ 'fundToMobile': authData.user }, { 'fundFromMobile': authData.user }] }, null, { sort: { 'createDate': -1 } }, function (err, singlehistoryData) {
                                if (err) {
                                    res.send(err);
                                }
                                else {
                                    for (var i = 0; i < singlehistoryData.length; i++) {
                                        if (authData.user === singlehistoryData[i].fundToMobile) {
                                            listtransaction.push({ fromtransaction: singlehistoryData[i].fundFromMobile, name: singlehistoryData[i].toName, toURL: singlehistoryData[i].toURL, fromdeposit: "Credit", transactionId: singlehistoryData[i].felosTransationId, tofund: singlehistoryData[i].fundToMobile, transactiondate: moment(singlehistoryData[i].createDate).format('L'), transactiontime: moment(singlehistoryData[i].createDate).format('LT'),
                                                transactionAmount: singlehistoryData[i].amount, transactionstatus: singlehistoryData[i].transactionstatus, transationType: singlehistoryData[i].transationType, transactionmonth: moment(singlehistoryData[i].createDate).format('MMM YYYY'), transactionyear: moment(singlehistoryData[i].createDate).format('YYYY') });
                                        }
                                        else {
                                            listtransaction.push({ fromtransaction: singlehistoryData[i].fundFromMobile, name: singlehistoryData[i].toName, toURL: singlehistoryData[i].toURL, fromdeposit: "Debit", transactionId: singlehistoryData[i].felosTransationId, tofund: singlehistoryData[i].fundToMobile, transactiondate: moment(singlehistoryData[i].createDate).format('L'), transactiontime: moment(singlehistoryData[i].createDate).format('LT'),
                                                transactionAmount: singlehistoryData[i].amount, transactionstatus: singlehistoryData[i].transactionstatus, transationType: singlehistoryData[i].transationType, transactionmonth: moment(singlehistoryData[i].createDate).format('MMM YYYY'), transactionyear: moment(singlehistoryData[i].createDate).format('YYYY') });
                                        }
                                    }
                                    //filter day
                                    if (req.body.filter == '' || req.body.filter == 'day' || req.body.filter == undefined) {
                                        var grouping = _.groupBy(listtransaction, function (element) {
                                            return element.transactiondate;
                                        });
                                        var TranasctionHistoryGraph = _.map(grouping, function (items, date) { return ({
                                            filter: date,
                                            data: items.length
                                        }); });
                                        if (listtransaction.length > 0) {
                                            res.status(200).json({ message: 'Sucessfully!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistoryGraph: TranasctionHistoryGraph });
                                        }
                                        else {
                                            res.status(200).json({ message: 'No Transaction History!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistoryGraph: TranasctionHistoryGraph });
                                        }
                                    }
                                    //filter month
                                    else if (req.body.filter == 'month') {
                                        var grouping = _.groupBy(listtransaction, function (element) {
                                            return element.transactionmonth;
                                        });
                                        var TranasctionHistoryGraph = _.map(grouping, function (items, month) { return ({
                                            filter: month,
                                            data: items.length
                                        }); });
                                        if (listtransaction.length > 0) {
                                            res.status(200).json({ message: 'Sucessfully!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistoryGraph: TranasctionHistoryGraph });
                                        }
                                        else {
                                            res.status(200).json({ message: 'No Transaction History!', data: customerDetail, frombalance: authDetail.remainingAmount, frombankstatus: authDetail.accountStatus, TranasctionHistoryGraph: TranasctionHistoryGraph });
                                        }
                                    }
                                    //filter year
                                    else if (req.body.filter == 'year') {
                                        var grouping = _.groupBy(listtransaction, function (element) {
                                            return element.transactionyear;
                                        });
                                        var TranasctionHistoryGraph = _.map(grouping, function (items, year) { return ({
                                            filter: year,
                                            data: items.length
                                        }); });
                                        if (listtransaction.length > 0) {
                                            res.status(200).json({ message: 'Sucessfully!', TranasctionHistoryGraph: TranasctionHistoryGraph });
                                        }
                                        else {
                                            res.status(200).json({ message: 'No Transaction History!', TranasctionHistoryGraph: TranasctionHistoryGraph });
                                        }
                                    }
                                }
                            });
                        });
                    }
                    else {
                        res.status(200).json({ message: 'Record not found!' });
                    }
                });
                //}
            }
        });
    };
    return CustomerController;
}());
exports.CustomerController = CustomerController;
