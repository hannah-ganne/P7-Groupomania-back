const Comment = require('../models/comment.js');

/**
 * Load all the comments
 */
exports.getAllComments = (req, res, next) => {
    Comment.findAll({ where: { postId : req.params.id }})
    .then(comments => res.send(comments))
    .catch(error => res.status(400).json({ error }));
};

/**
 * Leave a new comment 
 */
exports.createComment = (req, res, next) => {

    // create a comment
    const comment = {
        comment: req.body.comment,
        userId: req.token.userId,
        postId: req.params.id
    }

    Comment.create(comment)
    .then(data => res.send(data))
    .catch(error => res.status(400).json({ error }));
    };
