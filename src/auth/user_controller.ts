import { noneAreUndefined } from "../util/util_func";
import { post_user_exec, get_user_exec} from './user_repository';
import { tokenLife, refreshTokenLife } from "../consts";

export {}

const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const userRouter = express.Router();

const saltRounds = 13;

// Replace with redis
let userTokens = {}

// Creates user
userRouter.post("/create", async (req,res)=>{
    let {user_name, user_email, user_password, user_role} = req.body;

    let notDefined = noneAreUndefined({user_name, user_email, user_password, user_role})

    if(notDefined.length > 0){
        return res.json({error: notDefined + " are missing from request body"})
    }

    // Validate email, password, username and user_type

    let salt = bcrypt.genSaltSync(saltRounds);
    let password_hash = bcrypt.hashSync(user_password, salt);    

    try{
        await post_user_exec(user_name, user_email, password_hash, user_role);
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
    let {user_name, user_role, user_id} = user;
    console.log(user)
    // Get hash from db
    let isAuth = bcrypt.compareSync(user_password, user.user_password)  
    
    if(!isAuth)
        return res.send(403).json({success: false, error: "Invalid login credentials"});

    let userPayload = {user_name, user_role, user_id, user_email}
    
    let token = jwt.sign(userPayload, process.env.SECRET, {expiresIn: tokenLife})
    let refreshToken = jwt.sign(userPayload, process.env.REFRESH_SECRET, {expiresIn: refreshTokenLife})
    const response = {
        "user": userPayload,
        "token": token,
        "refreshToken": refreshToken
    }
    userTokens[refreshToken] = response
    // Store user details in session
    token = 'Bearer ' + token;
    return res.json({success: isAuth, user: userPayload ,token})
})

userRouter.post('/token', (req,res)=>{
    let {refreshToken, userPayload} = req.body;
    if(refreshToken && (refreshToken in userTokens)){
        const newToken = jwt.sign(userPayload, process.env.SECRET, {expiresIn: tokenLife})

        userTokens[refreshToken] = newToken;
        res.send(200).json({success:true,token: newToken})
    }else{
        res.send(404).json({error: "Invalid request"})
    }
})

module.exports = userRouter;