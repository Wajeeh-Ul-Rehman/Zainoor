const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { googleLogin } = require('../controllers/authController');

// Diagnostic logs to verify everything imported properly
console.log("Loading auth routes. Controller status:", {
    registerIsFunction: typeof authController.register === 'function',
    loginIsFunction: typeof authController.login === 'function',
    logoutIsFunction: typeof authController.logout === 'function',
    getUserWithHistoryIsFunction: typeof authController.getUserWithHistory === 'function',
    getAllUsersWithHistoryIsFunction: typeof authController.getAllUsersWithHistory === 'function',
    deleteUserIsFunction: typeof authController.deleteUser === 'function',
    deleteUsersBulkIsFunction: typeof authController.deleteUsersBulk === 'function'
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.put('/profile/:userId', authController.updateProfile);
router.post('/google', googleLogin);

// History routes
router.get('/users/all/history', authController.getAllUsersWithHistory);
router.get('/users/:userId/history', authController.getUserWithHistory);

//DELETE ROUTES
router.delete('/users/:userId', authController.deleteUser);         // Delete Single User
router.post('/users/delete-bulk', authController.deleteUsersBulk);   // Delete Bulk Users

//Reset Passwords 
// Add these two lines:
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;