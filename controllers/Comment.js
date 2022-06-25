const Comment = require('../models/Comment.js');

/**
 * Load all the comments
 */
exports.getAllComments = (req, res, next) => {
    Comment.findAll()
    .then(comments => res.send(comments))
    .catch(error => res.status(400).json({ error }));
};

/**
 * Leave a new comment
 */
exports.createComment = (req, res, next) => {
    // create a comment
    const commentObject = JSON.parse(req.body.comment);
    delete commentObject._id;
    const comment = {
        ...postObject,
        userId: req.token.userId,
    }

    Comment.create(comment)
    .then(data => res.send(data))
    .catch(error => res.status(400).json({ error }));
    };
