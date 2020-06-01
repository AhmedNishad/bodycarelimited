export {}

const jwt = require('jsonwebtoken')

export function authenticateMiddleWare(){
    return (req,res,next)=>{

    }
}

export const checkToken = (req,res,next)=>{
    let token:string = req.headers['x-access-token'] || req.headers['authorization']
    if(token == undefined || token.length < 8)
        return res.json({success:false, error: "Auth token not specified"})

    if(token.startsWith('Bearer')){
        token = token.slice(7, token.length)
    }

    if(token){
        try{
            jwt.verify(token, process.env.SECRET, (err, decoded)=>{
                if(err){
                    //console.log(token + " is invalid")
                    console.log(err)
                    return res.status(401).json({success:false, error:"Invalid token"})
                }else{
                    req.user = decoded;
                    next()
                }
        })
        }catch(err){
            console.log(err)
            return res.status(401).json({success:false, error: "Token has expired"})
        }
    }else{
        return res.status(401).json({success:false, error: "Auth token not specified"})
    }
}

export function authorizeForRoles(roles: Array<string>){
    // Get user id from req.user
    return (req,res,next)=>{
        let {user_role} = req.user;
        if(roles.filter(r=> r == user_role).length == 1){
            next();
        }else{
            return res.send(403).json({error: "Unauthorized for route " + req.originalUrl})
        }
    }
}