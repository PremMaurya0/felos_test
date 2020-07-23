import { Request, Response, NextFunction } from 'express';
const users = [{ id: 1, username: 'test', password: 'test'}];
export interface usertfa{
    mobileNumber?:any,
    userPassword?:string,
    tfa:{
        secret?:any;
        tempSecret?: any;
        dataURL:any;
        tfaURL?:any;
        token?:any;
        remaining?:any,
    },
     
    singleToken:any,
    singleTokenSecret:any
    
}

export class common{
         mobileNumber?:any;
         userPassword?:string;
         singleToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiUHJlbSIsIm1vYiI6Ijk5NTg4NjMwNzIifQ.nxScWqgH-YPy3Ul1pgVzHH1au5Z8Pr2ePWj3GIiP0g4";
         singleTokenSecret="prem@tss@123";
         tfa:any;
        
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

        static staticToken(req:Request,res:Response, next:NextFunction){
           //Get auth header value
           let bearerHeader=req.headers['authorization'];
           //check if bearer is undefined
           if(typeof bearerHeader!=='undefined'){
           //split at the space
           let bearer=bearerHeader.split(' ');
           //Get Token from array
           let bearerToken=bearer[1];
           //Set the token
           req.statictoken=bearerToken;
           //Next middleware
           next();
           }else{
               res.sendStatus(403);
           }
                
            }

        static userToken(req:Request,res:Response, next:NextFunction){
        //Get auth header value
          //  console.log(req.headers);
            let bearerHeader=req.headers['authorization'];
           // console.log(bearerHeader);
            //check if bearer is undefined
            if(typeof bearerHeader!=='undefined'){
            //split at the space
            let bearer=bearerHeader.split(' ');
            //Get Token from array
            let bearerToken=bearer[1];
            //Set the token
            req.userToken=bearerToken;
            //Next middleware
            next();
            }else{
                res.sendStatus(403);
            }
        }




        static qrcodeToken(req:Request,res:Response, next:NextFunction){
            //Get auth header value
              //  console.log(req.headers);
                let bearerHeader: any=req.headers['x-qrcodekey'];
               // console.log(bearerHeader);
                //check if bearer is undefined
                if(typeof bearerHeader!=='undefined'){
                //split at the space
                let bearer=bearerHeader.split(' ');
                //Get Token from array
                let bearerToken=bearer[1];
                //Set the token
                req.qrcodeToken=bearerToken;
                //Next middleware
                next();
                }else{
                    res.sendStatus(403);
                }
            }
    

        
        public validateEmailFormat(email:string){
            var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return re.test(email)
        }

}


