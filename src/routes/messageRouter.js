const Router = require('express');
const MessageController = require('../controllers/messageController');

const router = new Router();

router.post('/get', MessageController.getAll);
router.post('/send', MessageController.add);

module.exports = router;