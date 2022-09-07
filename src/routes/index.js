const Router = require('express');
const userRouter = require('./userRouter');
const messageRouter = require('./messageRouter');

const router = new Router();

router.use('/user', userRouter);
router.use('/message', messageRouter);

module.exports = router;