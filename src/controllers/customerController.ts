import * as mongoose from 'mongoose';
import { CustomerSchema, ICustomer, BankAccountSchema, IBankAccountDetails,
     ATMCardSchema, IAtmCard, eKYCSchema, IKYC,
    AddCustomerFundSchema,ICustomerAddFund,CustomerTransactionHistorySchema,ICustomerTransactionHistory
    } from '../models/customerModel';
import {  Response, Request } from 'express';
import bcrypt from 'bcryptjs'
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import {  common,usertfa } from '../common';
import jwt from "jsonwebtoken";
import nodemailer  from "nodemailer";
import moment = require('moment');
import _ = require("underscore");
let Cryptr= require('cryptr');
let userTfavar:usertfa=new common();

const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
const Bank = mongoose.model<IBankAccountDetails>('BankDetail', BankAccountSchema);
const ATMCard = mongoose.model<IAtmCard>('ATMCardDetail', ATMCardSchema);
const KYCDocument = mongoose.model<IKYC>('eKYCCustomer', eKYCSchema);
const AddFund = mongoose.model<ICustomerAddFund>('AddFundCustomer', AddCustomerFundSchema);
const CustomerTransaction = mongoose.model<ICustomerTransactionHistory>('TransactionCustomer', CustomerTransactionHistorySchema);

let   transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'premteastallstudio@gmail.com',
      pass: 'SmartBoy@@123'
    }
  });
  const cryptr = new Cryptr('fellobyPrem@123');

 

export class CustomerController {
       public groupBy(key:any, array:any):void {
        array.reduce((objectsByKeyValue:any, obj:any) => {
          const value = obj[key];
          objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
          return objectsByKeyValue;
        }, {});
      }
         
           // Tfauser =new userObject();
        public  addNewCustomer(req:Request,res:Response){
            let customer=new Customer(req.body);
           
            if(customer.firstName === "" || customer.firstName === undefined){
                res.status(428).json({message:"Enter Your Name!",error:true,success:false})
            }
            else if(customer.mobileNumber.length === 0 || customer.mobileNumber === "" || customer.mobileNumber === undefined){
                res.status(428).json({message:"Enter Your Mobile Number!",error:true,success:false})
            }
            else if(customer.mobileNumber.length !== 10){
                res.status(412).json({message:"Enter Your valid Mobile Number!",error:true,success:false})
            }
            else if(customer.userPassword === "" || customer.userPassword === undefined){
                res.status(428).json({message:"Enter Your password",error:true,success:false})
            }
            else if(customer.userPassword.length <= 6){
                res.status(411).json({message:"Password is too sort!",error:true,success:false})
            }
            else{

                Customer.findOne({mobileNumber:customer.mobileNumber},(err,existruslt)=>{
                    if(err) res.send(err);
                    if(existruslt){
                        res.json({message:"Mobile number already exist",error:true,success:false});
                    }else{
                        bcrypt.genSalt(10, function(err, salt) { 
                    if(err) res.send(err);
                        bcrypt.hash(customer.userPassword, salt, (err, hash)=> {
                         if(err) res.send(err); 
                              customer.userPassword= hash;                       
                              customer.save((err,result:ICustomer)=>{
                                if(err) res.send(err);

                                res.status(201).json({message:"Successfully created!",error:false,success:true,result});
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
                })


            }
        }
         // TFA Login Authentication
         public customerLogin(req:Request,res:Response){
        jwt.verify(req.statictoken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
            if(err) res.status(403).send({message: "Invalid Token please enter your valid token"});
            else{
                let CustomerCheck=new Customer(req.body);
                //  console.log(userTfavar.mobileNumber);
                 // console.log(userTfavar.tfa.tempSecret);
                  Customer.findOne({mobileNumber:CustomerCheck.mobileNumber},(err,result:ICustomer)=>{
                     if(err) res.send(err);
                     if(result){

                        if(result.verifyEmail==1 || result.verifyEmail==0){
                    //  console.log(userTfavar.tfa.secret);
                     // if (!userTfavar.tfa || !userTfavar.tfa.secret) {
                         bcrypt.compare(CustomerCheck.userPassword, result.userPassword, (err, isMatch)=> {
                             if(err) throw err;
                             if(isMatch){
  
                                    console.log(`DEBUG: Login without TFA is successful`);
                                    jwt.sign({user:result.mobileNumber,name:result.firstName,_Id:result._id, kycstatus:result.kycStatus,bankstatus:result.accountStatus, balance:result.remainingAmount, url:result.profilePic},userTfavar.singleTokenSecret,(err:any,token:any)=>{                         
                                      res.setHeader('X-Token',token);
                                       res.setHeader('Content-Type', 'application/x-www-form-urlencoded');
      
                                      Customer.findOneAndUpdate({mobileNumber:CustomerCheck.mobileNumber}, { $set:{ loginStatus: 1 }}, {upsert:true},(err:any)=>{
                                          if(err) res.send(err);
      
                                          return res.status(200).json({
                                                      message: "success without enabled TFA",
                                                      data:result.firstName,
                                                      tfaenabled:result.enableTfa
                                             });
      
                                       });
                                      
                                      });
                               }
                             else{
                              console.log(`DEBUG: Login without TFA is Invalid`);
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
                    }else{
                        return res.status(406).json({
                            "message": "Email Id is not Verify"
                        });
                     }
          
                     }
                     else{
                      return res.status(404).json({message:"Mobile is not registered!"});             
                     }
                 })
            }
            
        })
      
         }
        public tfaPostSetup(req:Request,res:Response){
        jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{

            if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});

            else{
        console.log(`DEBUG: Received TFA setup request`);
        console.log(authData.user);
            userTfavar.mobileNumber = authData.user;
            const secret = speakeasy.generateSecret({
                length: 10,
                name:authData.user,
                issuer: 'Felos v1.0',
            });
          
            var url = speakeasy.otpauthURL({
                secret: secret.base32,
                label:authData.user,
                issuer: 'Felos v1.0',
                encoding: 'base32'
            });

            QRCode.toDataURL(url, (err, dataURL) => {
                userTfavar.tfa={
                    secret:'',
                    tempSecret:secret.base32,
                    dataURL,
                    tfaURL:url,
                    token:speakeasy.totp({
                         secret:secret.base32,
                         encoding:'base32',
                    }),
                    remaining: (30 - Math.floor((new Date()).getTime() / 1000.0 % 30))
                }
                return res.json({
                    message: 'TFA Auth needs to be verified',
                    tempSecret: secret.base32,
                    dataURL,
                    tfaURL: secret.otpauth_url,
                    token:speakeasy.totp({
                        secret:userTfavar.tfa.tempSecret,
                         encoding:'base32',
                    }),
                    "remaining": (30 - Math.floor((new Date()).getTime() / 1000.0 % 30))
                });
            });
        }
        });

        }
        public tfaGetSetup(req:Request,res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{

                if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
    
                else{
                  //  delete userTfavar.tfa.secret;
                   res.json(userTfavar.tfa ? userTfavar.tfa : null);
                }
            });
        }
        public tfaDeleteSetup(req:Request,res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{

                if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
             else{
            console.log(`DEBUG: Received DELETE TFA request`);
            delete userTfavar.tfa.secret;
            console.log('pahale thi tha object',userTfavar.tfa.tempSecret);
            //console.log(userTfavar.tfa);
            Customer.findOneAndUpdate({mobileNumber:authData.user}, { $set:{ enableTfa: 0 }}, {upsert:true},(err:any)=>{
                if(err) res.send(err);
                return res.send({
                        status: 200,
                        message: "success"
                     });
                });
              }
            });
        }
        public tfaverify(req:Request,res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{

             if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
             else{
            console.log(`DEBUG: Received TFA Verify request`);
            console.log(userTfavar.tfa.tempSecret);
            console.log(req.body.token);
            let isVerified = speakeasy.totp.verify({
                secret: userTfavar.tfa.tempSecret,
                encoding: 'base32',
                token: req.body.token,
                window: 0
            });

            console.log(isVerified);

        if (isVerified) {
            console.log(`DEBUG: TFA is verified to be enabled`);
                userTfavar.tfa.secret = userTfavar.tfa.tempSecret;
                Customer.findOneAndUpdate({mobileNumber:authData.user}, { $set:{ enableTfa: 1 }}, {upsert:true},(err:any)=>{
                    if(err) res.send(err);
                    return res.send({
                        "status": 200,
                        "message": "Two-factor Auth is enabled successfully"
                    });
                });
             } else{
                 console.log(`ERROR: TFA is verified to be wrong`);
                    return res.send({
                        "status": 403,
                        "message": "Invalid Auth Code, verification failed. Please verify the system Date and Time"
                        });
                  }
              }
            });
        }

        public tfatokengenerate(req:Request,res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
    
                if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
    
                else{
                console.log(`DEBUG: Received TFA setup request`);

                userTfavar.mobileNumber = authData.user;
                    const secret = speakeasy.generateSecret({
                        length: 10,
                        name:authData.user,
                        issuer: 'NarenAuth v0.0',
                    }); 
                    userTfavar.tfa={
                        secret:'',
                        tempSecret:secret.base32,
                        dataURL:'',
                        tfaURL:'',
                        token:speakeasy.totp({
                             secret:secret.base32,
                             encoding:'base32',
                        }),
                        remaining: (30 - Math.floor((new Date()).getTime() / 1000.0 % 30))
                    }
                    return res.send({
                        message: 'TFA Auth needs to be verified',
                        "status": 200,
                        token:userTfavar.tfa.token,
                        remaining:userTfavar.tfa.remaining,
                        tempSecret:userTfavar.tfa.tempSecret
                    });
                 }
                });
        }
        public emailVerification(req:Request,res:Response){
             console.log(req.params.emailToken);
            req.header(req.params.emailToken)
             console.log(req.userToken);
          jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
            if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
             else{
                res.send({status: 200, message: "Email verification is successfully!!"});
             }
         });
        }
        public AddBankAccount(req:Request,res:Response){
         jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
           if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
            else{
                    var BankDetails=new Bank(req.body);
                    if(BankDetails.bankIFSC=="" || BankDetails.bankIFSC==undefined){
                        res.status(428).json({message: "Required IFSC Code!!"})
                    }
                    else if(BankDetails.bankBranch=="" || BankDetails.bankBranch==undefined){
                        res.status(428).json({ message: "Required Bank Branch !!"})
                    }
                    else if(BankDetails.bankName=="" || BankDetails.bankName==undefined){
                        res.status(428).json({message: "Required Bank Name !!"})
                    }
                    else if(BankDetails.bankMobileNumber=="" || BankDetails.bankMobileNumber==undefined){
                        res.status(428).json({message: "Required Bank Registerd Mobile Number !!"})
                    }
                    else if(BankDetails.bankAccount=="" || BankDetails.bankAccount==undefined){
                        res.status(428).json({message: "Required  Bank Account Number !!"})
                    }
                    else if(BankDetails.accountType=="" || BankDetails.accountType==undefined){
                        res.status(428).json({message: "Required  Bank Account Type !!"})
                    }
                   else{
                    
                         BankDetails.customerId=authData._Id;
                         Bank.findOne({account:BankDetails.account},(err,resultMatch)=>{
                          if(err)res.send(err);
                          if(resultMatch){
                            res.status(302).json({message: "This Account Number is already Added!!"});
                           }
                            else{
                            BankDetails.account=BankDetails.bankAccount;
                            const encryptedString = cryptr.encrypt(BankDetails.bankAccount);
                            BankDetails.bankAccount=encryptedString;
                       
                            BankDetails.save((err:any, saveAccount:IBankAccountDetails) => {
                                if(err) res.send(err);
                                Customer.findOneAndUpdate({mobileNumber:authData.user}, { $set:{ accountStatus: 1 }}, {upsert:true},(err:any)=>{
                                 if(err) res.send(err);
                               
                               const bankAccount=cryptr.decrypt(BankDetails.bankAccount);
                               const str = new Array(bankAccount.length - 4 + 1).join('x') + bankAccount.slice( -4);
                               saveAccount.bankAccount=str;
                              
                                res.status(201).json({message: "Account Update Successfully!!", saveAccount});
                                });
                            });  
                         }
                    });
                    
                 }  
            }
        });
        }
        public AddCardAccount(req:Request,res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
              if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
               else{
                       var ATMDetails=new ATMCard(req.body);
                       if(ATMDetails.cardType=="" || ATMDetails.cardType==undefined){
                        res.status(428).json({message: "Required ATM Card Type!!"})
                       }
                       else if(ATMDetails.cardholdername=="" || ATMDetails.cardholdername==undefined){
                        res.status(428).json({message: "Required cardholdername !!"})
                       }
                       else if(ATMDetails.cardNumber=="" || ATMDetails.cardNumber==undefined){
                        res.status(428).json({message: "Required Card Number!!"})
                       }
                       else if(ATMDetails.cardNumber.length != 16){
                        res.status(412).json({message: "Invalid Card Number!!"})
                     }
                       else if(ATMDetails.expiredMonth==""|| ATMDetails.expiredMonth=="0"|| ATMDetails.expiredMonth==undefined){
                        res.status(428).json({message: "Required Expired ATM Month!!"})
                       }
                       else if(ATMDetails.expiredYear=="" ||ATMDetails.expiredYear=="0" || ATMDetails.expiredYear==undefined){
                        res.status(428).json({message: "Required Expired ATM Year!!"})
                       }
                       
                      else{
                       
                             ATMDetails.customerId=authData._Id;
                             ATMCard.findOne({card:ATMDetails.cardNumber},(err,resultMatch)=>{
                             if(err)res.send(err);
                             if(resultMatch){
                                res.status(302).json({message: "This Card Number is already Added!!"});
                              }
                               else{
                                 ATMDetails.card=ATMDetails.cardNumber;
                                 const encryptedString = cryptr.encrypt(ATMDetails.cardNumber);
                                 ATMDetails.cardNumber=encryptedString;
                                
                                 //console.log(ATMDetails);

                                ATMDetails.save((err:any, saveCard:any) => {
                                   if(err) res.send(err);         

                                  // console.log(saveCard)
                                   saveCard.cardNumber=cryptr.decrypt(ATMDetails.cardNumber);
                                   const str = new Array(ATMDetails.card.length - 4 + 1).join('x') + ATMDetails.card.slice( -4);
                                   saveCard.cardNumber=str;
                                  res.status(201).json({message: "Account Update Successfully!!",saveCard}); 
                               });
                               
                            }
                       });
                       
                    }  
               }
           });
        }

        public AtmCardList(req:Request,res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
              if(err) res.status(403).json({message: "Invalid Token please enter your valid token"});
               else{
               console.log(authData._Id);
                ATMCard.find({customerId:authData._Id}, (err,cardList:any)=>{
                    if(err) res.send(err)
                    if(cardList){

                        for(var x=0; x < cardList.length; x++){

                           let decard=cryptr.decrypt(cardList[x].cardNumber);
                           const str = new Array(decard.length - 4 + 1).join('x') + decard.slice( -4);
                           cardList[x].cardNumber=str;

                        }

                        res.status(200).json({message: "All Card list!!", cardList}); 
                    }else{
                        res.status(200).json({ message: "Record is not found!!"}); 
                    }
                });
               }
            });
        }

        public AddKYCDocument(req:Request,res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
              if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
               else{
                  var KYCDetails=new KYCDocument(req.body);
                    if(KYCDetails.kycDocumentName=="" || KYCDetails.kycDocumentName==undefined){
                        res.send({status: 200, message: "Required kyc Document Name!!"})
                     }
                     else if(req.file==undefined){
                          res.send({status: 500, message: "Internal Error! Image fieldname missing parameter"})
                        }
                         else if(req.file.filename==''){
                        res.status(401).send({success:false,message:"kyc is required!"})
                         }
                      else{
                             KYCDetails.customerId=authData._Id;
                             KYCDetails.documentPath=req.file.filename;
                             KYCDetails.save((err:any, eKycData:IKYC) => {
                                if(err) res.send(err);   
                                Customer.findOneAndUpdate({mobileNumber:authData.user}, { $set:{ kycStatus: 1 }}, {upsert:true},(err:any)=>{
                                    if(err) res.send(err);      
                                 res.send({status: 200, message: "KYC Update Successfully!!", eKycData}); 
                                });
                             });                         
                    }  
               }
           });
        }
        public AddFundInWallet(req:Request,res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
              if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
               else{
                  var AddfundDetails=new AddFund(req.body);
                  var customerTranHistory=new CustomerTransaction(req.body);
                    if(AddfundDetails.amount==0 || AddfundDetails.amount==undefined){
                        res.send({status: 200, message: "Required amount!!"})
                     }
                     else if(AddfundDetails.amount <= 24){
                        res.send({status: 200, message: "Required amount minmum AED.25!!"})
                     }       
                      else{ 


                       
                                AddfundDetails.customerId=authData._Id;
                                AddfundDetails.felosTransationId="felos"+Math.random().toString(36).slice(2);
                                AddfundDetails.fundType="Cr";
                                AddfundDetails.fundstatus=1;
                                AddfundDetails.accountNumber="35264564125";
                                AddfundDetails.bankTransactionId=Math.random().toString(36).slice(3);
                                AddfundDetails.currencyType="INR";
                                AddfundDetails.fundlocation="Gurugram Hariyana SikandarPur Metro";
                                AddfundDetails.funddescription="Abc";
                               // res.send({status: 200, message: "Successfully!!", AddfundDetails});

                                customerTranHistory.customerId=authData._Id;
                                customerTranHistory.felosTransationId="felos"+Math.random().toString(36).slice(2);
                                customerTranHistory.transationType="Added Fund!!"; 
                                customerTranHistory.toName=authData.name; 
                                customerTranHistory.toURL=authData.url;                                                 
                                customerTranHistory.fundFromMobile="NA"; 
                                customerTranHistory.fundToMobile=authData.user;                                                     
                                customerTranHistory.location="Gurugram Hariyana SikandarPur Metro";
                                customerTranHistory.transactionstatus=1; 
                                customerTranHistory.amount=AddfundDetails.amount;

                                AddfundDetails.save((err:any, eKycData:ICustomerAddFund) => {
                                   if(err) {
                                       res.send(err);
                                    }
                                 else{
                                   Customer.findOne({mobileNumber:authData.user},(err:any,checkblance:ICustomer)=>{
                                    if(err) res.send(err); 
                                    //Add New Balance
                                    let balance=(checkblance.remainingAmount + AddfundDetails.amount);
                                   // balance
                                   Customer.findOneAndUpdate({mobileNumber:authData.user}, { $set:{ remainingAmount: balance }}, {upsert:true},(err:any)=>{
                                       if(err) res.send(err);   

                                       customerTranHistory.save((err:any, History:ICustomerTransactionHistory) => {
                                        if(err) {
                                            res.send(err);
                                         }
                                      else{
                                           
                                       Customer.findOne({mobileNumber:authData.user},(err:any,checkblancedata:ICustomer)=>{
                                        if(err) res.send(err); 
                                         res.send({status: 200, message: "Added Fund Successfully!!", checkblancedata}); 
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
        }
        public UpdateCustomer(req:Request,res:Response){
           
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
                
                if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
                 else{
           
                    let customerDetails=new Customer(req.body);
            if(customerDetails.lastName === "" || customerDetails.lastName === undefined){
                res.json({message:"Enter Your Last Name!",error:true,success:false});
            }
           else if(customerDetails.dateOfBirth === "" || customerDetails.dateOfBirth === undefined){
                res.json({message:"Enter Your Date Of Birth!",error:true,success:false});
            }
            else if(customerDetails.fromCounteryType === "" || customerDetails.fromCounteryType === undefined){
                res.json({message:"Enter Your From Country Type!",error:true,success:false});
            }
            else if(customerDetails.country === "" || customerDetails.country === undefined){
                res.json({message:"Enter Your country!",error:true,success:false})
            }
            else if(customerDetails.localityAddress === "" || customerDetails.localityAddress === undefined){
                res.json({message:"Enter Your locality Address!",error:true,success:false});
            } 
            else{
              
                Customer.findOneAndUpdate({mobileNumber:authData.user},
                    {'$set':{lastName:customerDetails.lastName,dateOfBirth:customerDetails.dateOfBirth, fromCounteryType:customerDetails.fromCounteryType,
                        country:customerDetails.country,localityAddress:customerDetails.localityAddress
                    }},
                     {upsert:true},(err:any)=>{
                    if(err) res.send(err); 
                    Customer.findOne({mobileNumber:authData.user},(err:any,Customerdata:ICustomer)=>{
                        if(err) res.send(err); 
                         res.send({status: 200, message: "Update Successfully!!", Customerdata}); 
                        });
                 });

                }
             }
    
         });
        }
        public UpdateCustomerProfile(req:Request,res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{   
                if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
                 else{
                     console.log(req.file);
                    let customerProfile=new Customer(req.body);
                     if(req.file==undefined){
                        res.send({status: 500, message: "Internal Error! Image fieldname missing parameter"})
                      }
                       else if(req.file.filename==''){
                      res.status(401).send({success:false,message:"kyc is required!"})
                       }
            else{
                customerProfile.profilePic=req.file.filename;

                Customer.findOneAndUpdate({mobileNumber:authData.user},{'$set':{profilePic:customerProfile.profilePic}}, {upsert:true},(err:any)=>{
                    if(err) res.send(err); 
                    Customer.findOne({mobileNumber:authData.user},(err:any,Profiledata:ICustomer)=>{
                        if(err) res.send(err); 
                         res.send({status: 200, message: "Added Fund Successfully!!", Profiledata}); 
                        });
                   });
             
                }
             }
    
         });
        }
        public changePassword(req:Request,res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{   
                if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
                 else{
                    let CustomerChenge=new Customer(req.body);
                    if(req.body.oldPassword=="" || req.body.oldPassword==undefined){
                        res.send({status: 428, message: "Required Old Password!"})
                      }
                   else if(CustomerChenge.userPassword=="" || CustomerChenge.userPassword==undefined){
                        res.send({status: 428, message: "Required New Password!"})
                      }
                      else if(CustomerChenge.userPassword.length <= 6){
                        res.json({message:"Password is too sort!",error:true,success:false})
                     }
                       else if(req.body.rePassword=='' || req.body.rePassword==undefined){
                         res.send({status: 428, message: "Required Re-Password!"})
                       }
                       else if(req.body.rePassword!=CustomerChenge.userPassword){
                        res.send({status: 500, message: "Password dose not match!"});
                      }
            else{
                Customer.findOne({mobileNumber:authData.user},(err,result:ICustomer)=>{
                    if(err) res.send(err);
                    if(result){
                         bcrypt.compare(req.body.oldPassword, result.userPassword, (err, isMatch)=> {
                         if(err) throw err;
                            if(isMatch){

                                bcrypt.genSalt(10, function(err, salt) { 
                                 if(err) res.send(err);

                                bcrypt.hash(CustomerChenge.userPassword, salt, (err, hash)=> {
                                    if(err) res.send(err); 

                                    CustomerChenge.userPassword= hash; 

                                    Customer.findOneAndUpdate({mobileNumber:authData.user},
                                        {'$set':{userPassword:CustomerChenge.userPassword}},
                                        {upsert:true},(err:any)=>{
                                        if(err) res.send(err); 
                                        res.send({status: 200, message: "Password change successfully!"})
                                    });

                                });

                            });

                            }else{
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
        }
        public Wallet2Wallet(req:Request,res:Response){

            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
              if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
               else{
                  var customerTranHistory=new CustomerTransaction(req.body);
                    if(customerTranHistory.fundToMobile=="" || customerTranHistory.fundToMobile==undefined){
                        res.send({status: 428, message: "Required Mobile Number Send to Money!"})
                     }
                     else if(customerTranHistory.amount==0 || customerTranHistory.amount==undefined){
                        res.send({status: 428, message: "Required amount!!"});
                     } 
                     else if(customerTranHistory.amount<=1){
                        res.send({status: 200, message: "You paid amount minmum AED.1.00 !!"});
                     }      
                      else{  let transaction:any=Math.random().toString(36).slice(2);
                              

                                Customer.findOne({mobileNumber:customerTranHistory.fundToMobile},(err,isMatch:ICustomer)=>{
                                    if(err) res.send(err);
                                   // console.log(isMatch);
                                    if(isMatch){

                                        Customer.findOne({mobileNumber:authData.user},(err,isMatchbalance:ICustomer)=>{
                                            if(err) res.send(err);

                                            let totalbalnce=isMatchbalance.remainingAmount;

                                            if(customerTranHistory.amount>=totalbalnce){
                                                res.send({status: 200, message: "Your amount balance is not suffiecient!!",remaingBalance:totalbalnce});
                                            }else{

                                                let creditnewbalance=(isMatch.remainingAmount+customerTranHistory.amount);
                                                let debitnewbalance=(totalbalnce-customerTranHistory.amount);

                                                Customer.findOneAndUpdate({mobileNumber:authData.user}, { $set:{ remainingAmount: debitnewbalance }}, {upsert:true},(err:any)=>{
                                                    if(err) res.send(err); 
                                                   
                                                 Customer.findOneAndUpdate({mobileNumber:customerTranHistory.fundToMobile}, { $set:{ remainingAmount: creditnewbalance }}, {upsert:true},(err:any)=>{
                                                    if(err) res.send(err);

                                                    Customer.findOne({mobileNumber:authData.user},(err:any,checkblancenewdata:ICustomer)=>{
                                                     if(err) res.send(err);  


                                                     customerTranHistory.customerId=authData._Id;
                                                     customerTranHistory.felosTransationId="felos"+transaction;
                                                     customerTranHistory.transationType="Wallet2Wallet";   
                                                     customerTranHistory.toName=isMatch.firstName;                                                   
                                                     customerTranHistory.fundFromMobile=authData.user; 
                                                     customerTranHistory.toURL=isMatch.profilePic;                                         
                                                     customerTranHistory.location="Gurugram Hariyana SikandarPur Metro";
                                                     customerTranHistory.transactionstatus=1; 

                                                     customerTranHistory.save((err:any, History:ICustomerTransactionHistory) => {
                                                        if(err) {
                                                            res.send(err);
                                                         }
                                                      else{
                                                            
                                                        Customer.findOne({mobileNumber:customerTranHistory.fundToMobile},(err:any,Todata:ICustomer)=>{
                                                            if(err) res.send(err);

                                                          res.send({status: 200, message: "Payment Successfully Transfer!", remainingAmount:checkblancenewdata.remainingAmount,toname:Todata.firstName,tomobile:Todata.mobileNumber}); 
                                                        });
                                                       
                                                        }

                                                     });

                                                     });
                                                 });
                                                });                               
                                            }
                                        });
                                    }
                                    else{
                                        res.send({status: 401, message: "Reciver is not valid or registered!!"});
                                }
                        });   
                    }  
               }
           });
        }

        public genQrCodeAccount(req:Request, res:Response){

            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
                if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
                 else{
                      //Customer.findOne({mobileNumber:authData.user},(err,resultcustomer:ICustomer)=>{
                        //  if(err) res.status(404).send(err);         
                       // if(resultcustomer){

                          let qrcode:any=Math.random().toString(36).slice(2);
                            res.setHeader('X-qrcodekey', "felos"+qrcode);
                            res.setHeader('X-site','felos');   
                            let r = Math.random().toString(36).substring(3); 
                            var segs:any = [
                                { data: r.toUpperCase(), mode: 'alphanumeric' },
                                { data: authData.user, mode: 'numeric' }
                               
                              ]
                              QRCode.toDataURL(segs, { errorCorrectionLevel: 'H', version: 2 }, function(err, data_url){
                                  if(err) res.status(509).send(err);  
                                  res.status(201).json({
                                      message: 'Generate Qrcode Successfully',
                                      data_url:data_url,
                                      mobile:authData.user,
                                      qrcodekey:qrcode
                                  });
                              });

                        // });
                       // }

                    // })
                   
                   
                }
            });
        }

        public verifyQrCodeAccount(req:Request, res:Response){

            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
                if(err) res.status(428).json({flag:0, message: "Invalid Token please enter your valid token"});
                 else{
                    let customeraccount=new Customer(req.body);
           
                     if(customeraccount.mobileNumber == "" || customeraccount.mobileNumber == undefined) {
                         res.status(428).json({flag:0, message:'mobile no. is required!!'});
                     }
                     else if(req.headers['x-site'] == "" || req.headers['x-site'] == undefined) {
                        res.status(428).json({flag:0, message:'missing parameter required1!!'});
                    }
                    else{
                          
                            if(req.headers['x-site'] !=undefined){
                                    if(req.headers['x-site']=="felos"){
                                        console.log(customeraccount.mobileNumber);
                                        console.log(authData.user);
                                        if(customeraccount.mobileNumber==authData.user){

                                            res.status(401).json({flag:0, message:"Sorry, It seem like you are scaning your own QR code "});
                                        }
                                        else{

                                            Customer.findOne({mobileNumber:authData.user},(err, authDetail:ICustomer)=>{
                                               if(err) res.status(500).json({flag:0, message:'Internal error'});
                                               if(authDetail){
                   
                                                   Customer.findOne({mobileNumber:customeraccount.mobileNumber},(err, customerDetail:ICustomer)=>{
                                                       if(err) res.status(500).json({flag:0, message:'Internal error'});
                   
                                                       let listtransaction:any=[];
                                                       CustomerTransaction.find({fundFromMobile:authData.user,fundToMobile:customeraccount.mobileNumber}, (err, singlehistoryData:any)=>{
                                                          if(err){ res.send(err);}
                                                          else{
                             
                                                             for(var i=0; i<singlehistoryData.length;i++){
                                                               listtransaction.push({fromtransaction:singlehistoryData[i].fundFromMobile,name:singlehistoryData[i].toName,toURL:singlehistoryData[i].toURL,fromdeposit:"Credit",transactionId:singlehistoryData[i].felosTransationId,tofund:singlehistoryData[i].fundToMobile,transactiondate:moment(singlehistoryData[i].createDate).format('L'),transactiontime:moment(singlehistoryData[i].createDate).format('LT'),
                                                               transactionAmount:singlehistoryData[i].amount,transactionstatus:singlehistoryData[i].transactionstatus, transationType:singlehistoryData[i].transationType,transactionmonth:moment(singlehistoryData[i].createDate).format('MMM YYYY'),transactionyear:moment(singlehistoryData[i].createDate).format('YYYY')});                                                                            
                                                          
                                                             }
                                                             
                                                      
                                                           const grouping = _.groupBy(listtransaction, function(element:any){
                                                               return element.transactiondate;
                                                            });
                                                               const TranasctionHistory = _.map(grouping, (items, date) => ({
                                                                   filter: date,
                                                                   data: items
                                                               }));
                   
                   
                                                       if(listtransaction.length>0) {
                                                           res.status(200).json({message:'Sucessfully!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistory}); 
                                                       }else{
                                                           res.status(200).json({message:'No Transaction History!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistory}); 
                                                       }
                   
                                                    
                   
                                                          }
                                                     });
                                                
                                                   });
                                               }
                                              else{
                                              res.status(200).json({ message:'Record not found!'});  
                                            }
                   
                                        });
                                       }
                                        
                                 }
                                 else{
                                    res.status(401).json({flag:0, message:'invalid scan1'}); 
                                 }

                            }else{
                                res.status(401).json({flag:0, message:'invalid scan2'}); 
                            }
                     
                 }
                }
            });
        }
       
        public customerAlllist(req:Request, res:Response){

            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
                if(err) res.status(428).json({flag:0, message: "Invalid Token please enter your valid token"});
                 else{
                        
                         Customer.find({},(err, customer:any)=>{
                            if(err) res.status(500).json({flag:0, message:'Internal error'});
                            if(customer){
                                let dataCustomer=[];
                               for(var x=0; x< customer.length; x++){
                                dataCustomer.push({name:customer[x].firstName, mobile:customer[x].mobileNumber, profileimg:customer[x].profilePic})
                               }
                                res.status(200).send({message:'Sucessfully!',customerData:dataCustomer});   
                           }
                           else{
                           res.status(200).json({ message:'Record not found!'});  
                         }

                     });
                  
                }
            });
        }

        public customersingleDetail(req:Request, res:Response){

            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
                if(err) res.status(428).json({flag:0, message: "Invalid Token please enter your valid token"});
                 else{
                         let customeraccount=new Customer(req.body);  
                            
                         if(customeraccount.mobileNumber=='' && customeraccount.mobileNumber==undefined) {
                            res.status(428).json({message:'mobile number is required!'});  
                         }else{

                         Customer.findOne({mobileNumber:authData.user},(err, authDetail:ICustomer)=>{
                            if(err) res.status(500).json({flag:0, message:'Internal error'});
                            if(authDetail){

                                Customer.findOne({mobileNumber:customeraccount.mobileNumber},(err, customerDetail:ICustomer)=>{
                                    if(err) res.status(500).json({flag:0, message:'Internal error'});

                                    let listtransaction:any=[];
                                    CustomerTransaction.find({fundFromMobile:authData.user,fundToMobile:customeraccount.mobileNumber}, (err, singlehistoryData:any)=>{
                                       if(err){ res.send(err);}
                                       else{
          
                                          for(var i=0; i<singlehistoryData.length;i++){
                                            listtransaction.push({fromtransaction:singlehistoryData[i].fundFromMobile,name:singlehistoryData[i].toName,toURL:singlehistoryData[i].toURL,fromdeposit:"Credit",transactionId:singlehistoryData[i].felosTransationId,tofund:singlehistoryData[i].fundToMobile,transactiondate:moment(singlehistoryData[i].createDate).format('L'),transactiontime:moment(singlehistoryData[i].createDate).format('LT'),
                                            transactionAmount:singlehistoryData[i].amount,transactionstatus:singlehistoryData[i].transactionstatus, transationType:singlehistoryData[i].transationType,transactionmonth:moment(singlehistoryData[i].createDate).format('MMM YYYY'),transactionyear:moment(singlehistoryData[i].createDate).format('YYYY')});                                                                            
                                       
                                          }
                                          
                                   
                                        const grouping = _.groupBy(listtransaction, function(element:any){
                                            return element.transactiondate;
                                         });
                                            const TranasctionHistory = _.map(grouping, (items, date) => ({
                                                filter: date,
                                                data: items
                                            }));


                                    if(listtransaction.length>0) {
                                        res.status(200).json({message:'Sucessfully!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistory}); 
                                    }else{
                                        res.status(200).json({message:'No Transaction History!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistory}); 
                                    }

                                 

                                       }
                                  });
                             
                                });
                            }
                           else{
                           res.status(200).json({ message:'Record not found!'});  
                         }

                     });
                    }
                    
                }
            });
        }

        public CustomerTransactionHistory(req:Request, res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
                if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
                 else{
                    let listtransaction:any=[];
                   CustomerTransaction.find({fundFromMobile:authData.user}, (err, historyData:any)=>{
                        if(err){ res.send(err);}
                        else{
                            if(historyData){
                                for(var x=0; x<historyData.length;x++){
                                    listtransaction.push({fromtransaction:historyData[x].fundFromMobile,fromdeposit:historyData[x].fromdepositeType,transactionId:historyData[x].felosTransationId,tofund:historyData[x].fundToMobile,transactiondate:historyData[x].createDate,
                                        transactionAmount:historyData[x].amount,transactionstatus:historyData[x].transactionstatus, transationType:historyData[x].transationType}); 
                                }                           
                            }                        
                            AddFund.find({customerId:authData._Id}, (err, historycrData:any)=>{
                             if(err){ res.send(err);}         
                             else{                                 
                                 if(historycrData){
                                     for(var xx=0; xx<historycrData.length;xx++){
                                         listtransaction.push({fromtransaction:historycrData[xx].accountNumber,fromdeposit:historycrData[xx].fundType,transactionId:historycrData[xx].felosTransationId,tofund:authData.user,transactiondate:historycrData[xx].createDate,
                                             transactionAmount:historycrData[xx].amount,transactionstatus:historycrData[xx].fundstatus
                                             , transationType:"Add Fund from Bank"});         
                                     }         
                                 }
                                 if(listtransaction.length>0) {
                                    res.status(200).json({message:"Successfully created!",error:false,success:true, listtransaction});
                                 }else{
                                    res.status(200).json({message:"No Tranasction history!",error:false,success:true});
                                 }                                
                             }
                            });   
                        }
                   });                 
                 }           
             });
        }
 
        public customerTransaction(req:Request, res:Response){
            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
                if(err) res.send({status: 403, message: "Invalid Token please enter your valid token"});
                 else{
                     if(req.body.tomobileNo=='' || req.body.tomobileNo==undefined){
                        res.status(428).json({message:'tomobile number is required!'}); 
                     }else{
                        let listtransaction:any=[];
                          CustomerTransaction.find({fundFromMobile:authData.user,fundToMobile:req.body.tomobileNo}, (err, singlehistoryData:any)=>{
                             if(err){ res.send(err);}
                             else{

                                for(var i=0; i<singlehistoryData.length;i++){

                                    listtransaction.push({fromtransaction:singlehistoryData[i].fundFromMobile,fromdeposit:singlehistoryData[i].fromdepositeType,transactionId:singlehistoryData[i].felosTransationId,tofund:singlehistoryData[i].fundToMobile,transactiondate:singlehistoryData[i].createDate,
                                        transactionAmount:singlehistoryData[i].amount,transactionstatus:singlehistoryData[i].transactionstatus, transationType:singlehistoryData[i].transationType});
                                    // res.status(200).json({message:"No Tranasction history!",singlehistoryData});
                                }
                                if(listtransaction.length>0) {
                                    res.status(200).json({message:"Successfully created!",error:false,success:true, listtransaction});
                                 }else{
                                    res.status(200).json({message:"No Tranasction history!",error:false,success:true});
                                 }
                             }
                        });
                     }
                 }
            });
        }

        public customerDetail(req:Request, res:Response){

            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
                if(err) res.status(428).json({flag:0, message: "Invalid Token please enter your valid token"});
                 else{

                        var pageNo= parseInt(req.body.pageNo)||1;

                         Customer.findOne({mobileNumber:authData.user},(err, authDetail:ICustomer)=>{
                            if(err) res.status(500).json({flag:0, message:'Internal error'});
                            if(authDetail){

                                Customer.findOne({mobileNumber:authData.user},(err, customerDetail:ICustomer)=>{
                                    if(err) res.status(500).json({flag:0, message:'Internal error'});

                                    let listtransaction:any=[];
                                    CustomerTransaction.find({$or:[{'fundToMobile':authData.user},{'fundFromMobile':authData.user}]}, null, {sort: {'createDate' : -1 }}, (err, singlehistoryData:any)=>{
                                       if(err){ res.send(err);}
                                       else{
          
                                          for(var i=0; i<singlehistoryData.length;i++){
                                         if(authData.user===singlehistoryData[i].fundToMobile ){
                                                 listtransaction.push({fromtransaction:singlehistoryData[i].fundFromMobile,name:singlehistoryData[i].toName,toURL:singlehistoryData[i].toURL,fromdeposit:"Credit",transactionId:singlehistoryData[i].felosTransationId,tofund:singlehistoryData[i].fundToMobile,transactiondate:moment(singlehistoryData[i].createDate).format('L'),transactiontime:moment(singlehistoryData[i].createDate).format('LT'),
                                                     transactionAmount:singlehistoryData[i].amount,transactionstatus:singlehistoryData[i].transactionstatus, transationType:singlehistoryData[i].transationType,transactionmonth:moment(singlehistoryData[i].createDate).format('MMM YYYY'),transactionyear:moment(singlehistoryData[i].createDate).format('YYYY')});                                                  
                                          
                                             }else{                                             
                                                 listtransaction.push({fromtransaction:singlehistoryData[i].fundFromMobile,name:singlehistoryData[i].toName,toURL:singlehistoryData[i].toURL,fromdeposit:"Debit",transactionId:singlehistoryData[i].felosTransationId,tofund:singlehistoryData[i].fundToMobile,transactiondate:moment(singlehistoryData[i].createDate).format('L'),transactiontime:moment(singlehistoryData[i].createDate).format('LT'),
                                                     transactionAmount:singlehistoryData[i].amount,transactionstatus:singlehistoryData[i].transactionstatus, transationType:singlehistoryData[i].transationType,transactionmonth:moment(singlehistoryData[i].createDate).format('MMM YYYY'),transactionyear:moment(singlehistoryData[i].createDate).format('YYYY')});                                                                        
                                             }
                                              }
                                                //filter day
                                                if(req.body.filter==''||req.body.filter=='day' || req.body.filter==undefined){
                                                 const grouping = _.groupBy(listtransaction, function(element:any){
                                                        return element.transactiondate;
                                                });
                                                const TranasctionHistory = _.map(grouping, (items, date) => ({
                                                    filter: date,
                                                    data: items
                                                }));
                                               

                                                if(listtransaction.length>0) {
                                                    res.status(200).json({message:'Sucessfully!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistory}); 
                                                   }else{
                                                    res.status(200).json({message:'No Transaction History!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistory}); 
                                                   }

                                                }

                                                  //filter month
                                                else if(req.body.filter=='month'){

                                               var helper:any = {};
                                              
                                                   var result = listtransaction.reduce(function(r:any, o:any,indx:any) {
                                                      
                                                    var key = o.name + '-' + o.transactionmonth;
                                                     if(!helper[key]) {
                                                        if (o.tofund !== authData.user) {
                                                             helper[key] = Object.assign({}, o); // create a copy of o
                                                                    r.push(helper[key]);            
                                                                    helper[key].count=1;  
                                                      
                                                                   if(listtransaction[indx].fromdeposit=="Credit" &&  helper[key].transactionmonth==listtransaction[indx].transactionmonth &&  listtransaction[indx].transationType==="Wallet2Wallet"){                                                                  
                                                                    helper[key].totalCreditAmount=(parseInt(listtransaction[indx].transactionAmount)); 
                                                                    helper[key].totalDebitAmount=0;                                                                  
                                                                   } 
                                                                   if(listtransaction[indx].fromdeposit=="Debit" &&  helper[key].transactionmonth==listtransaction[indx].transactionmonth){
                                                                    helper[key].totalCreditAmount=0;
                                                                     helper[key].totalDebitAmount=(parseInt(listtransaction[indx].transactionAmount));                                                                  
                                                                 } 
                                                                }
                                                              } else {
                                                                if (helper[key].tofund !== authData.user) {

                                                                 helper[key].count=(helper[key].count||0)+1;
                                                                 if(listtransaction[indx].fromdeposit=="Credit" && helper[key].transactionmonth==listtransaction[indx].transactionmonth &&  listtransaction[indx].transationType==="Wallet2Wallet"){                        
                                                                    helper[key].totalCreditAmount +=(parseInt(listtransaction[indx].transactionAmount)); 
                                                                    helper[key].totalDebitAmount +=(parseInt(helper[key].totalDebitAmount));             
                                                                   }
                                                                   if(listtransaction[indx].fromdeposit=="Debit" &&  helper[key].transactionmonth==listtransaction[indx].transactionmonth){
                                                                     helper[key].totalCreditAmount +=(parseInt(helper[key].totalCreditAmount));
                                                                     helper[key].totalDebitAmount +=(parseInt(listtransaction[indx].transactionAmount));                                                                  
                                                                     }

                                                                    }
                                                              }
                                                            
                                                           return r;
                                                       }, []);


                                                 const grouping:any = _.groupBy(result, function(element:any){

                                                        return element.transactionmonth;
                                                });
                                                const TranasctionHistory:any = _.map(grouping, (items, month) => ({                                                   
                                                    filter: month,
                                                    data: items
                                                }));
                                          
                                            if(listtransaction.length>0) {
                                                res.status(200).json({message:'Sucessfully!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistory}); 
                                               }else{
                                                res.status(200).json({message:'No Transaction History!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistory}); 
                                               }

                                            }
                                                  //filter year
                                               else if(req.body.filter=='year'){
                                               
                                                var helper:any = {};
                                              
                                                var result = listtransaction.reduce(function(r:any, o:any,indx:any) {
                                        
                                                 var key = o.name + '-' + o.transactionyear;
                                               //  if (o.tofund !== authData.user) {
                                                  if(!helper[key]) {
                                                    if (o.tofund !== authData.user) {
                                                          helper[key] = Object.assign({}, o); // create a copy of o
                                                                 r.push(helper[key]);            
                                                                 helper[key].count=1;  
                                                   
                                                                if(listtransaction[indx].fromdeposit=="Credit" &&  helper[key].transactionmonth==listtransaction[indx].transactionmonth &&  listtransaction[indx].transationType==="Wallet2Wallet"){                                                                  
                                                                 helper[key].totalCreditAmount=(parseInt(listtransaction[indx].transactionAmount)); 
                                                                 helper[key].totalDebitAmount=0;                                                                  
                                                                } 
                                                                if(listtransaction[indx].fromdeposit=="Debit" &&  helper[key].transactionmonth==listtransaction[indx].transactionmonth){
                                                                 helper[key].totalCreditAmount=0;
                                                                  helper[key].totalDebitAmount=(parseInt(listtransaction[indx].transactionAmount));                                                                  
                                                              } 

                                                            }
                                                                
                                                           } else {
                                                            if (helper[key].tofund !== authData.user) {
                                                              helper[key].count=(helper[key].count||0)+1;
                                                              if(listtransaction[indx].fromdeposit=="Credit" && helper[key].transactionmonth==listtransaction[indx].transactionmonth &&  listtransaction[indx].transationType==="Wallet2Wallet"){                        
                                                                 helper[key].totalCreditAmount +=(parseInt(listtransaction[indx].transactionAmount)); 
                                                                 helper[key].totalDebitAmount +=(parseInt(helper[key].totalDebitAmount));             
                                                                }
                                                                if(listtransaction[indx].fromdeposit=="Debit" &&  helper[key].transactionmonth==listtransaction[indx].transactionmonth){
                                                                  helper[key].totalCreditAmount +=(parseInt(helper[key].totalCreditAmount));
                                                                  helper[key].totalDebitAmount +=(parseInt(listtransaction[indx].transactionAmount));                                                                  
                                                                  } 
                                                                }
                                                           }
                                                         
                                                        return r;
                                                    }, []);
                                               
                                          

                                              const grouping:any = _.groupBy(result, function(element:any){

                                                     return element.transactionyear;
                                             });
                                             const TranasctionHistory:any = _.map(grouping, (items, year) => ({                                                   
                                                 filter: year,
                                                 data: items
                                             }));


                                         if(listtransaction.length>0) {
                                             res.status(200).json({message:'Sucessfully!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistory}); 
                                            }else{
                                             res.status(200).json({message:'No Transaction History!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistory}); 
                                            }

                                        }
                                    
                                       }
                                  }).skip(10*(pageNo-1)).limit(10);
                             
                                });
                            }
                           else{
                           res.status(200).json({ message:'Record not found!'});  
                         }

                     });
                    //}
                    
                }
            });
        }
      
        public recentUser(req:Request, res:Response){

            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
                if(err) res.status(428).json({flag:0, message: "Invalid Token please enter your valid token"});
                 else{
                         Customer.findOne({mobileNumber:authData.user},(err, authDetail:ICustomer)=>{
                            if(err) res.status(500).json({flag:0, message:'Internal error'});
                            if(authDetail){

                                Customer.findOne({mobileNumber:authData.user},(err, customerDetail:ICustomer)=>{
                                    if(err) res.status(500).json({flag:0, message:'Internal error'});
                                    let listtransaction:any=[];
                                    CustomerTransaction.find({$or:[{'fundToMobile':authData.user},{'fundFromMobile':authData.user}]}, null, {sort: {'createDate' : -1 }}, (err, singlehistoryData:any)=>{
                                       if(err){ res.send(err);}
                                       else{         
                                          for(var i=0; i<singlehistoryData.length;i++){
                                                if(singlehistoryData[i].fundFromMobile!="NA" ){
                                                        listtransaction.push({fromtransaction:singlehistoryData[i].fundFromMobile,name:singlehistoryData[i].toName,toURL:singlehistoryData[i].toURL,fromdeposit:"Credit",transactionId:singlehistoryData[i].felosTransationId,tofund:singlehistoryData[i].fundToMobile,transactiondate:moment(singlehistoryData[i].createDate).format('L'),transactiontime:moment(singlehistoryData[i].createDate).format('LT'),
                                                            transactionAmount:singlehistoryData[i].amount,transactionstatus:singlehistoryData[i].transactionstatus, transationType:singlehistoryData[i].transationType,transactionmonth:moment(singlehistoryData[i].createDate).format('MMM YYYY'),transactionyear:moment(singlehistoryData[i].createDate).format('YYYY')});                                                  
                                                
                                                 }
                                              }
                                             const grouping = _.groupBy(listtransaction, function(element:any){
                                                        return element.tofund  || element.fromtransaction;
                                             });
                                            const TranasctionHistory = _.map(grouping, (items, name) => (                                                    
                                                    {
                                                  "fromtransaction": items[0].fromtransaction,
                                                    "name": items[0].name,
                                                    "toURL": items[0].toURL,
                                                    "fromdeposit": items[0].fromdeposit,
                                                    "transactionId": items[0].transactionId,
                                                    "tofund": items[0].tofund,
                                                    "transactiondate": items[0].transactiondate,
                                                    "transactiontime":items[0].transactiontime,
                                                    "transactionAmount": items[0].transactionAmount,
                                                    "transactionstatus": items[0].transactionstatus,
                                                    "transationType": items[0].transationType,
                                                    "transactionmonth": items[0].transactionmonth,
                                                    "transactionyear": items[0].transactionyear,
                                                    "count":items.length,
                                                   
                                             }));
                                                let RecentUser:any=[];
                                                for(var x=0;x<TranasctionHistory.length;x++){
                                                    if(TranasctionHistory[x].tofund==authData.user){  
                                                        RecentUser.push({tofund:TranasctionHistory[x].fromtransaction,transactiontime:TranasctionHistory[x].transactiontime,transactiondate:TranasctionHistory[x].transactiondate});
                                                        }
                                                    else{
                                                        RecentUser.push({tofund:TranasctionHistory[x].tofund,transactiontime:TranasctionHistory[x].transactiontime,transactiondate:TranasctionHistory[x].transactiondate});
                                                     }
                                                }
                                                const grouping1 = _.groupBy(RecentUser, function(element:any){
                                                    return element.tofund;
                                                });
                                               const TranasctionHistory1 = _.map(grouping1, (items, name) =>                                    
                                                 items[0].tofund,
                                                );   
                                                 var finalRecent:any=[]      
                                                 Customer.find({mobileNumber:{ "$in" :TranasctionHistory1} },(err, customerList:any)=>{
                                                     if(err) throw err;                                                  
                                                     if(customerList.length>0){
                                                        for(var x=0;x<customerList.length;x++){
                                                            finalRecent.push({Mobile:customerList[x].mobileNumber,name:customerList[x].firstName,image:customerList[x].profilePic})
                                                         }
                                                         res.status(200).json({message:'Sucessfully!',data:finalRecent.reverse()});
                                                     }
                                                     else{
                                                        res.status(200).json({message:'Sucessfully!',data:"No Recent User"});
                                                     }
                                                    
                                                 })

                                       }
                                  }).limit(10);
                             
                                });
                            }
                           else{
                           res.status(200).json({ message:'Record not found!'});  
                         }
                     });
                }
            });
        }
      
        public graphData(req:Request, res:Response){

            jwt.verify(req.userToken,userTfavar.singleTokenSecret, (err:any,authData:any)=>{
                if(err) res.status(428).json({flag:0, message: "Invalid Token please enter your valid token"});
                 else{

                     
                         Customer.findOne({mobileNumber:authData.user},(err, authDetail:ICustomer)=>{
                            if(err) res.status(500).json({flag:0, message:'Internal error'});
                            if(authDetail){

                                Customer.findOne({mobileNumber:authData.user},(err, customerDetail:ICustomer)=>{
                                    if(err) res.status(500).json({flag:0, message:'Internal error'});

                                    let listtransaction:any=[];
                                    CustomerTransaction.find({$or:[{'fundToMobile':authData.user},{'fundFromMobile':authData.user}]}, null, {sort: {'createDate' : -1 }}, (err, singlehistoryData:any)=>{
                                       if(err){ res.send(err);}
                                       else{
          
                                          for(var i=0; i<singlehistoryData.length;i++){
                                         if(authData.user===singlehistoryData[i].fundToMobile ){
                                                 listtransaction.push({fromtransaction:singlehistoryData[i].fundFromMobile,name:singlehistoryData[i].toName,toURL:singlehistoryData[i].toURL,fromdeposit:"Credit",transactionId:singlehistoryData[i].felosTransationId,tofund:singlehistoryData[i].fundToMobile,transactiondate:moment(singlehistoryData[i].createDate).format('L'),transactiontime:moment(singlehistoryData[i].createDate).format('LT'),
                                                     transactionAmount:singlehistoryData[i].amount,transactionstatus:singlehistoryData[i].transactionstatus, transationType:singlehistoryData[i].transationType,transactionmonth:moment(singlehistoryData[i].createDate).format('MMM YYYY'),transactionyear:moment(singlehistoryData[i].createDate).format('YYYY')});                                                  
                                          
                                             }else{                                             
                                                 listtransaction.push({fromtransaction:singlehistoryData[i].fundFromMobile,name:singlehistoryData[i].toName,toURL:singlehistoryData[i].toURL,fromdeposit:"Debit",transactionId:singlehistoryData[i].felosTransationId,tofund:singlehistoryData[i].fundToMobile,transactiondate:moment(singlehistoryData[i].createDate).format('L'),transactiontime:moment(singlehistoryData[i].createDate).format('LT'),
                                                     transactionAmount:singlehistoryData[i].amount,transactionstatus:singlehistoryData[i].transactionstatus, transationType:singlehistoryData[i].transationType,transactionmonth:moment(singlehistoryData[i].createDate).format('MMM YYYY'),transactionyear:moment(singlehistoryData[i].createDate).format('YYYY')});                                                                        
                                             }
                                              }
                                                //filter day
                                                if(req.body.filter==''||req.body.filter=='day' || req.body.filter==undefined){
                                                    const grouping = _.groupBy(listtransaction, function(element:any){
                                                        return element.transactiondate;
                                                });
                                                const TranasctionHistoryGraph = _.map(grouping, (items, date) => ({
                                                    filter: date,
                                                    data: items.length
                                                }));


                                                if(listtransaction.length>0) {
                                                    res.status(200).json({message:'Sucessfully!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistoryGraph}); 
                                                   }else{
                                                    res.status(200).json({message:'No Transaction History!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistoryGraph}); 
                                                   }

                                                }

                                                  //filter month
                                                else if(req.body.filter=='month'){

                                             
                                                 const grouping:any = _.groupBy(listtransaction, function(element:any){

                                                        return element.transactionmonth;
                                                });
                                              
                                                const TranasctionHistoryGraph:any = _.map(grouping, (items:any, month) => ({
                                                    filter: month,
                                                    data: items.length
                                                }));

                                            if(listtransaction.length>0) {
                                                res.status(200).json({message:'Sucessfully!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistoryGraph}); 
                                               }else{
                                                res.status(200).json({message:'No Transaction History!', data:customerDetail,  frombalance:authDetail.remainingAmount, frombankstatus:authDetail.accountStatus,TranasctionHistoryGraph}); 
                                               }

                                            }
                                                  //filter year
                                               else if(req.body.filter=='year'){
                                           

                                              const grouping:any = _.groupBy(listtransaction, function(element:any){

                                                     return element.transactionyear;
                                             });
                                           
                                             const TranasctionHistoryGraph:any = _.map(grouping, (items:any, year) => ({
                                                filter: year,
                                                data: items.length
                                            }));
                                            
                                         if(listtransaction.length>0) {
                                             res.status(200).json({message:'Sucessfully!', TranasctionHistoryGraph}); 
                                            }else{
                                             res.status(200).json({message:'No Transaction History!',TranasctionHistoryGraph}); 
                                            }

                                        }
                                    
                                       }
                                  });
                             
                                });
                            }
                           else{
                           res.status(200).json({ message:'Record not found!'});  
                         }

                     });
                    //}
                    
                }
            });
        }
      
        
}