const Router = require('express');
const MessageController = require('../controllers/messageController');

const router = new Router();

router.get('/', MessageController.getAll);
router.post('/send', MessageController.add);

module.exports = router;