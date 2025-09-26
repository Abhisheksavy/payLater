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
router.post("/dashboardSummary", authCheck, userController.getDashboardSummary)

// Route : /api/user/updateConnectionDetails -> Route for storing connection details once bank is linked with project
router.post("/updateConnectionDetails", authCheck, userController.updateConnectionDetails)

// Route : /api/user/getSpendingByCategory -> Returns user's spending by category
router.get("/getSpendingByCategory", authCheck, userController.getSpendingByCategory)

// Route : /api/user/getMonthlyDashboardSummary -> Returns user's monthly data
router.get("/getMonthlyDashboardSummary", authCheck, userController.getMonthlyDashboardSummary);

// Route : /api/user/verify -> Checks if user is logged in or not
router.post("/verify", authCheck, userController.verify);

// Route : /api/user/recentActivity -> Returns user's latest reward history
router.get("/recentActivity", authCheck, userController.getRecentActivity);

// Route : /api/user/getAchievements -> Returns user's achievements
router.get("/getAchievements", authCheck, userController.getAchievements);

// Route : /api/user/goal -> saves user's goal
router.post("/goal", authCheck, userController.saveGoal);

// Route : /api/user/reminder -> saves user's reminder
router.post("/reminder", authCheck, userController.saveReminder);

export default router;
