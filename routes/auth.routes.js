const express = require("express");
const router = express.Router();

// auth controller
const authController = require("../controllers/auth.controller");

// go to signup form
router.get("/signup", authController.getSignup);

// create new user
router.post("/signup", authController.signup);

// login user
router.get("/login", authController.getLogin);

router.post("/login", authController.login);

router.post("/logout", authController.logout);

module.exports = router;
