import { Router } from "express";
import { userController } from "../controller/user.controller.js";
import { authCheck } from "../middlewares/AuthCheck.js";

const router = Router();

// Route : /api/user/register -> Route for user register
router.post("/register", userController.register)

// Route : /api/user/login -> Route for user login
router.post("/login", userController.login)

// Route : /api/user/logout -> Clears cookie
router.post("/logout", authCheck, userController.logout)

// Route : /api/user/accountSummary -> Route for fetching user's account history
router.get("/account", authCheck, userController.getUserAccounts)

// Route : /api/user/getDashboardSummary -> Route for Dashboard Data
router.get("/dashboardSummary", authCheck, userController.getDashboardSummary)

// Route : /api/user/updateConnectionDetails -> Route for storing connection details once bank is linked with project
router.post("/updateConnectionDetails", authCheck, userController.updateConnectionDetails)

// Route : /api/user/verify -> Checks if user is logged in or not
router.get("/verify", authCheck, userController.verify);

export default router;