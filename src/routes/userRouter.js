const Router = require('express');
const UserController = require('../controllers/userController');

const router = new Router();

router.get('/', UserController.getAll);
router.post('/register', UserController.register);
router.post('/login',  UserController.login);
router.post('/online', UserController.setIsOnline);

module.exports = router;