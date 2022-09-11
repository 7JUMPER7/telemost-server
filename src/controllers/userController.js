const ApiError = require('../error/ApiError');
const { User } = require('../models/models');
const bcrypt = require('bcrypt');

class UserController {
    async getAll(req, res, next) {
        try {
            const users = await User.findAll({order: [
                ['isOnline', 'DESC'],
                ['name', 'ASC']
            ]});
            return res.json(users);
        } catch(e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async register(req, res, next) {
        const {login, password, name} = req.body;

        if(!login || !password || !name) {
            return next(ApiError.badRequest('Not all params passed.'));
        }

        try {
            const hashPassword = await bcrypt.hash(password, 5);

            const user = await User.create({login: login.toLowerCase(), password: hashPassword, name, isOnline: true});
            return res.json(user);
        } catch(e) {
            if(e.message === 'Validation error') {
                return next(ApiError.badRequest('Login already taken'));
            }
            next(ApiError.badRequest(e.message));
        }
    }

    async login(req, res, next) {
        const {login, password} = req.body;

        if(!login || !password) {
            return next(ApiError.badRequest('Not all params passed.'));
        }

        try {
            const user = await User.findOne({where: {login}});

            if(user) {
                const isPasswordCorrect = await bcrypt.compare(password, user.password);

                if(isPasswordCorrect) {
                    return res.json({ok: true, name: user.name, login: user.login, password: user.password});
                }
                return next(ApiError.badRequest('Password is incorrect'));
            }
            return next(ApiError.badRequest('User not found'));
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async setIsOnline(req, res, next) {
        const {login, isOnline} = req.body;

        if(isOnline == undefined || isOnline === null || !login) {
            return next(ApiError.badRequest('Not all params passed.'));
        }

        try {
            const user = await User.findOne({where: {login}});
            if(user) {
                await user.update({isOnline});
                return res.json({ok: true});
            }
            return next(ApiError.badRequest('User not found.'));
        } catch(e) {
            next(ApiError.badRequest(e.message));
        }
    }
}

module.exports = new UserController();