const Like = require('../models/likes');

/**
 * like/dislike/cancel like/dislike post
 */
exports.likePost = (req, res, next) => {
    const likeObject = {
        type: req.body.like,
        postId: req.params.id,
        userId: req.token.userId
    }

    Like.findOne({ where: { postId: req.params.id, userId: req.token.userId } })
        .then(like => {
            if (!like) {
                Like.create(likeObject)
                .then(() => res.status(201).json({ message: 'like or disliked'}))
                .catch(error => res.status(400).json({ error }));
            } else {
                if (req.body.like === like.type) {
                    Like.destroy({ where: { postId: req.params.id, userId: req.token.userId }})
                    .then(() => res.status(200).json({ message: 'like or disliked cancelled'}))
                    .catch(error => res.status(400).json({ error }));
                } else {
                    res.send({ message: 'Post already liked or disliked'})
                }
            }
        })
        .catch(error => res.status(500).json({ message: "There's an " + error }));
        }