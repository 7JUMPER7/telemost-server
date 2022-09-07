const ApiError = require("../error/ApiError");
const { Message, User } = require("../models/models");
const CryptoJS = require("crypto-js");

class MessageController {
    async getAll(req, res, next) {
        try {
            const messages = await Message.findAll({include: [{model: User, attributes: ['name', 'login', 'isOnline']}]});
            
            for(let message of messages) {
                message.text = CryptoJS.AES.decrypt(message.text, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
            }

            return res.json(messages);
        } catch(e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async add(req, res, next) {
        const {login, text} = req.body;

        if(!login || !text) {
            return next(ApiError.badRequest('Not all params passed.'));
        } 

        try {
            const user = await User.findOne({where: {login: login.toLowerCase()}});

            if(user) {
                const encryptedText = CryptoJS.AES.encrypt(text, process.env.SECRET_KEY).toString();
                const message = await Message.create({text: encryptedText, userId: user.id});
                return res.json(message);
            }
            return next(ApiError.badRequest('User not found.'));
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
}

module.exports = new MessageController();