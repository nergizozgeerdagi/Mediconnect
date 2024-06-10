require("dotenv").config();
const jwt = require("jsonwebtoken");
const models=require("../../models/index")
const auth = async (req, res, next) => {
   const tokenStr = req.header("Authorization");
   console.log("tokenStr",tokenStr)
   if (!tokenStr) {
      return res.status(401).json({ error: "Please authenticate." });
   }

   const token = tokenStr.replace("Bearer ", "");

   try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await models.User.findOne({
         where:{
            id:decoded.userId
         }
      });
      if (!user) {
         return res.status(401).json({ error: "Please authenticate." });
      }
      req.user = user;
      next();
   } catch (error) {
      return res.status(401).json({ error: "Please authenticate." });
   }
};

module.exports = auth;
