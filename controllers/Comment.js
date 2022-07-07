const Comment = require('../models/comment.js');

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
    
// /**
//  * Delete a comment
//  */
// exports.deleteComment = (req, res, next) => {

//     Comment.findOne()
// }
