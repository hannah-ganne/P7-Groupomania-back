const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const AES = require('../utils/AES');
const fs = require('fs');
const Post = require('../models/post');

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
                userId: user.id,
                token: jwt.sign(
                    { userId: user.id },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: '24h' }
                    ) 
            });
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ message: "there's an" + error }));
};

/**
 * Profile setting
 */

exports.setProfile = (req, res, next) => {
    
    User.findOne({
        where:
            { id: req.token.userId }
    })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }
            
            // Modification
            let userObject;
            if(req.file) {
                const filename = user.imageUrl.split('/images/')[1];
                if (user.imageUrl) {
                    fs.unlinkSync(`images/${filename}`);
                }
                userObject = {
                    ...req.body.user,
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                    department: req.body.department,
                    expertIn: req.body.expertIn,
                    interestedIn: req.body.interestedIn,
                    oneWord: req.body.oneWord,
                    isUpFor: req.body.isUpFor
                }
            } else {
                userObject = {
                    ...req.body.user,
                    department: req.body.department,
                    expertIn: req.body.expertIn,
                    interestedIn: req.body.interestedIn,
                    oneWord: req.body.oneWord,
                    isUpFor: req.body.isUpFor
                }
            }

            User.update( userObject, { where: { id: req.token.userId }})
            .then(user => res.status(200).json({ message: 'Profile updated'}))
            .catch(error => res.status(400).json({ message: "There's an " + error }));
        })
}

/**
 * Profile viewing
 */
exports.viewProfile = (req, res, next) => {

    Post.findOne({ where: { id: req.params.id }, include: User })
        .then(post => {
            const userProfile = {
                name: `${post.user.firstName} ${post.user.lastName}`,
                department: post.user.department,
                expertIn: post.user.expertIn,
                interestedIn: post.user.interestedIn,
                oneWord: post.user.oneWord,
                isUpFor: post.user.isUpFor
            }
            res.send(userProfile)
        })
        .catch(error => res.status(500).json({ message: "There's an " + error }));
};
