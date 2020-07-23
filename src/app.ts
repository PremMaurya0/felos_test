import express, { Application, Request, Response, NextFunction} from "express";
import * as bodyParser from "body-parser";
import mongoose from 'mongoose'
import cors  from "cors";
import { requestLoggerMiddleware } from './request.logger.middleware';
import { UsersRoutes, CouponsRoutes, CashbacksRoutes, CustomerRoutes, EkycRoutes} from "./routes/index";
class App {

     public app: Application = express();
     public routeUser: UsersRoutes = new UsersRoutes();
     public routeCoupon: CouponsRoutes = new CouponsRoutes();
     public routeCashback: CashbacksRoutes = new CashbacksRoutes();
     public routeCustomer: CustomerRoutes = new CustomerRoutes();
     public routeEkyc: EkycRoutes = new EkycRoutes();
     public mongoUrl: string = 'mongodb://localhost:27017/angular7app';

    constructor() {
        this.config();
        this.mongoSetup();
        this.routeUser.routes(this.app);
        this.routeCoupon.routes(this.app);
        this.routeCashback.routes(this.app);  
        this.routeCustomer.routes(this.app); 
        this.routeEkyc.routes(this.app);
    }

    private config(): void{
        this.app.use((req:Request, res:Response, next:NextFunction)=>{
            res.header('Access-Control-Allow-Origin','*');
            res.header('Access-Control-Allow-Headers','Origin, X-Requested-with, Accept, Authorization');
            res.header('Access-Control-Allow-Methods','OPTIONS,GET, POST, PUT, DELETE');
             next();
        });
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // serving static files 
        this.app.use(cors({
            exposedHeaders: ['X-Token', 'x-tfa', 'x-qrcodekey','x-site'],
          }));
        this.app.use(express.static('public'));
        this.app.use(express.static('KycDocument'));
        this.app.use(requestLoggerMiddleware);

    }
    private mongoSetup(): void{
         mongoose.Promise = global.Promise;
         mongoose.connect(this.mongoUrl, {useNewUrlParser: true, useFindAndModify: false});
         var cnn=mongoose.connection;
            cnn.on("connected",function(err,res){
                if(err){
                    console.log(err)
                }else{
                    console.log("DataBase is Connected Successfully!");
                }         
            });
            cnn.on("disconnected",function(err,res){
                if(err){
                    console.log(err);
                }else{
                    console.log("Disconnected Successfully!");
                }   
            });
            cnn.on('error',console.error.bind(console,"Error Dedected!!!"));
            cnn.on('close', function () {
                console.log('close');
            });
            cnn.on('open', function () {
                console.log('open');
            });
            cnn.on('connecting', function () {
                console.log('connecting');
            });
            cnn.on('reconnected', function () {
                console.log('reconnected');
            });  
    }

}

export default new App().app;