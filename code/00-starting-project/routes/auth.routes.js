const express = require("express");
const router = express.Router();

// auth controller
const authController = require("../controllers/auth.controller");

// middleware that is specific to this router
// const timeLog = (req, res, next) => {
//   console.log("Time: ", Date.now());
//   next();
// };
// router.use(timeLog);

router.get("/signup", authController.getSignup);
router.get("/login", authController.getLogin);

// define the about route
// router.get("/about", (req, res) => {
//   res.send("About birds");
// });

module.exports = router;
