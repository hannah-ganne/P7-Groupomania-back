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
    if (req.body.comment) {
        Comment.create(comment)
        .then(data => res.send(data))
        .catch(error => res.status(400).json({ error }));
    }
};
    
// /**
//  * Delete a comment
//  */
exports.deleteComment = (req, res, next) => {

    const id = req.params.commentId;

    Comment.findByPk(id)
    .then(comment => {
        if (!comment) {
            return res.status(404).json({
                error: new Error('Comment does not exist')
            })
        }
        if (comment.userId !== req.token.userId && !req.token.isAdmin) {
            return res.status(403).json({
                error: new Error('Request not authorized')
            })
        } else if (comment.userId === req.token.userId || req.token.isAdmin) {
            Comment.destroy({ where: { id: id } })
            .then(() => res.status(200).json({ message: 'Comment deleted'}))
            .catch(error => res.status(400).json({ error }));
        }
    })
    .catch(error => res.status(500).json({ message: "There's an " + error }));
}
