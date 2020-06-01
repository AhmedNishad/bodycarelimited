import { noneAreUndefined } from "../util/util_func";
import { post_user_exec, get_user_exec, get_user_by_id_exec} from './user_repository';
import { post_sales_user_exec, get_salesman_by_user_id_exec } from '../sales/salesman_repository'
import { tokenLife, refreshTokenLife } from "../consts";
import { authenticateMiddleWare } from "../middleware";
import { sendMail, sendEmail } from "../util/email_service";

export {}

const express = require('express');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const userRouter = express.Router();

const saltRounds = 13;

// Replace with redis
let userTokens = {}


// Creates user
userRouter.post("/create", async (req,res)=>{
    let {user_name, user_email, user_password, user_role} = req.body;
    
    let isSalesman = user_role === 'salesman'
    
    let notDefined = noneAreUndefined({user_name, user_email, user_password, user_role})
    
    if(notDefined.length > 0){
        return res.json({error: notDefined + " are missing from request body"})
    }
    
    // Validate email, password, username and user_type
    
    let salt = bcrypt.genSaltSync(saltRounds);
    let password_hash = bcrypt.hashSync(user_password, salt);    
    
    try{
        let user_id = await post_user_exec(user_name, user_email, password_hash, user_role);
        
        if(isSalesman)
        await post_sales_user_exec({salesman_name: user_name, user_id})
        
        // Send thanks for signing up

        return res.json({success: true})
    }catch(err){
        console.log(err)
        return res.json({error: "Error saving user"})
    }
})

userRouter.post("/login", async (req,res)=>{
    let {user_email, user_password} = req.body;
    
    let notDefined = noneAreUndefined({user_email, user_password})
    
    if(notDefined.length > 0){
        return res.json(400).json({error: notDefined + " are missing from request body"})
    }
    
    // Validate email, password
    let user = await get_user_exec(user_email)
    user = user[0]
    if(user == undefined)
    return res.status(403).json({error: "Username and Password do not match"})
    
    let {user_name, user_role, user_id} = user;
    console.log(user)
    // Get hash from db
    let isAuth = bcrypt.compareSync(user_password, user.user_password)  
    
    if(!isAuth){
        // Notify failed login request
        sendEmail(user_email, "Suspicious Login Attempt", "There was a failed login attempt at " + Date.now())
        return res.status(403).json({success: false, error: "Invalid login credentials"});
    }
    
    
    let userPayload: any = {user_name, user_role, user_id, user_email}
    
    // Attach salesman to payload
    if(user_role == 'salesman')
    userPayload.salesman = await get_salesman_by_user_id_exec(user_id)
    
    let token = jwt.sign(userPayload, process.env.SECRET, {expiresIn: tokenLife})
    let refreshToken = jwt.sign(userPayload, process.env.REFRESH_SECRET, {expiresIn: refreshTokenLife})
    const response = {
        "user": userPayload,
        "token": token,
        "refreshToken": refreshToken
    }
    userTokens[refreshToken] = response
    // Store user details in session
    //token = 'Bearer ' + token;
    return res.json({success: isAuth, user: userPayload ,token, refreshToken})
})

userRouter.post('/token', (req,res)=>{
    let {refreshToken} = req.body;
    
    if(refreshToken && (refreshToken in userTokens)){
        try{
            let decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET)
            let {user_name, user_email, user_id, user_role} = decoded
            let newPayload: any = {
                user_name, user_email, user_id, user_role
            }
            if(decoded.salesman){
                newPayload.salesman = decoded.salesman
            }
            console.log(newPayload)
            const newToken = jwt.sign(newPayload, process.env.SECRET, {expiresIn: tokenLife})
            const newRefreshToken = jwt.sign(newPayload, process.env.REFRESH_SECRET, {expiresIn: refreshTokenLife})
            // ToDO - Regenerate new refresh token and send back with request token
            userTokens[refreshToken] = {};
            const response  = {
                "user": newPayload,
                "token": newToken,
                "refreshToken": newRefreshToken
            }
            // Remove the existing value from object
            delete userTokens[refreshToken] 
            userTokens[newRefreshToken] = response
            res.status(200).json({success:true,token: newToken,refreshToken: newRefreshToken})
    }catch(err){
        console.log(err)
        res.status(403).json({error: 'Token has expired'})
    }
    }else{
        res.status(403).json({error: "Invalid request"})
    }
    
})

userRouter.get("/current",  authenticateMiddleWare, async (req,res)=>{
    console.log("Current user " + req.user.user_id)
    const currentUser = await get_user_by_id_exec(req.user.user_id);
    res.json({currentUser})
})

module.exports = userRouter;