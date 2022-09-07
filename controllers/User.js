const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const AES = require('../utils/AES');
const fs = require('fs');
const capitalize = require('../utils/capitalize')
    
/**
 * user sign up
 */
exports.signup = (req, res, next) => {

    bcrypt.hash(req.body.password, 10)
        .then(hash => {

            if (req.body.firstName && req.body.lastName && req.body.email && req.body.password) {

            User.findOne({
                where: 
                    { email: AES.encrypt(req.body.email) }
            })
                .then(user => {
                    if (user) {
                        return res.status(409).json({ message: 'Email already exists'})
                    }

                    const userObject = {
                        firstName: capitalize.firstLetter(req.body.firstName),
                        lastName: capitalize.firstLetter(req.body.lastName),
                        email: AES.encrypt(req.body.email),
                        password: hash,
                        isUpFor: [
                            {
                                id: 1,
                                label: "Coffee chat",
                                checked: false
                            },
                            {
                                id: 2,
                                label: "Zoom meetings",
                                checked: false
                            },
                            {
                                id: 3,
                                label: "Conferences",
                                checked: false
                            },
                            {
                                id: 4,
                                label: "Office parties",
                                checked: false
                            },
                            {
                                id: 5,
                                label: "Collaborations",
                                checked: false
                            },
                            {
                                id: 6,
                                label: "Afterwork happy hour",
                                checked: false
                            },
                            {
                                id: 7,
                                label: "Lunch meeting",
                                checked: false
                            },
                            {
                                id: 8,
                                label: "Book club",
                                checked: false
                            }
                        ]
                    };    
                    
                    User.create(userObject)
                    .then(() => res.status(201).json({ message: 'User created' }))
                    .catch(error => res.status(400).json({ error }));
                })
                .catch(error => res.status(500).json({ error }))
        } else {
            res.status(400).json({ message: 'Empty field is not allowed' })
        }
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
                isAdmin: user.isAdmin,
                token: jwt.sign(
                    { userId: user.id, isAdmin: user.isAdmin},
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: '24h' }
                ),
                imageUrl: user.imageUrl
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
            if (req.file) {
                if (user.imageUrl) {
                    const filename = user.imageUrl.split('/images/')[1];
                    fs.unlinkSync(`images/${filename}`);
                }
                userObject = {
                    ...req.body,
                    firstName: capitalize.firstLetter(req.body.firstName),
                    lastName: capitalize.firstLetter(req.body.lastName),
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                    department: req.body.department,
                    expertIn: req.body.expertIn,
                    interestedIn: req.body.interestedIn,
                    oneWord: req.body.oneWord,
                    isUpFor: JSON.parse(req.body.isUpFor)
                }
            } else {
                userObject = {
                    ...req.body,
                    firstName: capitalize.firstLetter(req.body.firstName),
                    lastName: capitalize.firstLetter(req.body.lastName),
                    department: req.body.department,
                    expertIn: req.body.expertIn,
                    interestedIn: req.body.interestedIn,
                    oneWord: req.body.oneWord,
                    isUpFor: JSON.parse(req.body.isUpFor)
                }
            }
            
            const imageUrl = user.imageUrl
            User.update(userObject, { where: { id: req.token.userId } })
                .then(user => {
                    if (req.file) {
                        res.status(200).json({ imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` })
                    } else {
                        res.status(200).json({ imageUrl: imageUrl})
                    }
                }
                )
                .catch(error => res.status(400).json({ message: "There's an " + error }));
        })
}

/**
 * Profile viewing
 */
exports.viewProfile = (req, res, next) => {

    User.findOne({
        where: { id: req.token.userId }
    })
        .then(user => {
            const userProfile = {
                firstName: user.firstName,
                lastName: user.lastName,
                department: user.department,
                expertIn: user.expertIn,
                interestedIn: user.interestedIn,
                oneWord: user.oneWord,
                isUpFor: user.isUpFor,
                imageUrl: user.imageUrl
            }
            res.send(userProfile)
        })
        .catch(error => res.status(500).json({ message: "There's an " + error }));
};

exports.getAllUsers = (req, res, next) => {
    User.findAll()
        .then(users => res.send(users))
        .catch(error => res.status(400).json({ message: "There's an " + error }));
}

/**
 * Delete account
 */
exports.deleteUser = (req, res, next) => {

    User.destroy({
        where: { id: req.params.userId }
    })
        .then(() => res.status(200).json({ message: 'User account deleted'}))
        .catch(error => res.status(400).json({ error }));
};