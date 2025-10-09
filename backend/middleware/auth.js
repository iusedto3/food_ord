import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const {token} = req.headers;
    if(!token){
        return res.json({success: false, message: "No token, authorization denied"});
    }
    try{
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = token_decode.id;
        next();
    } catch(error){
        console.log(error);
        res.json({success: false, message: "Token is not valid"});

    }

}

export default authMiddleware;