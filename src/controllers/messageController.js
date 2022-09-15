const ApiError = require("../error/ApiError");
const { Message, User } = require("../models/models");
const CryptoJS = require("crypto-js");
const bcrypt = require('bcrypt');

class MessageController {
    async getAll(req, res, next) {
        const {login, password} = req.body;

        if(!login || !password) {
            return next(ApiError.badRequest('Not all params passed.'));
        } 

        const user = await User.findOne({where: {login}});

        if(!user) {
            return next(ApiError.badRequest('User not found'));
        } else {
            if(password !== user.password) {
                return next(ApiError.badRequest('Password is incorrect'));
            }
    
            try {
                let messages = await Message.findAll({include: [{model: User, attributes: ['name', 'login', 'isOnline']}], raw: true});
                
                messages = messages.map((message) => {
                    message.text = CryptoJS.AES.decrypt(message.text, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
                    if(message.userId === user.id) {
                        message.isUserMessage = true;
                    } else {
                        message.isUserMessage = false;
                    }
                    return message;
                });
    
                return res.json(messages);
            } catch(e) {
                next(ApiError.badRequest(e.message));
            }
        }
    }

    async add(req, res, next) {
        const {user, text} = req.body;

        if(!user || !user.login || !text) {
            return next(ApiError.badRequest('Not all params passed.'));
        } 

        try {
            const user = await User.findOne({where: {login: user.login.toLowerCase()}});

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