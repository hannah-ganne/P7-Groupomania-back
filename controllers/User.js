const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AES = require('../utils/AES');


/**
 * user sign up
 */
exports.signup = (req, res, next) => {

    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: AES.encrypt(req.body.email),
        password: hash
        };

        User.create(user)
        .then(() => res.status(201).json({ message: 'User created' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

/**
 * user log in
 */
exports.login = (req, res, next) => {

    User.findOne( { where: 
        { email: AES.encrypt(req.body.email) }
        })
        .then(user => {
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
            if (!valid) {
                return res.status(401).json({ error: 'Incorrect password' });
            }
            res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    { userId: user._id },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: '24h' }
                    ) 
            });
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ message: "there's an" + error }));
};