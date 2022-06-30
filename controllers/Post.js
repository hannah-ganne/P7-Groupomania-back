const Post = require('../models/post.js');
const fs = require('fs');

/**
 * Load all the posts
 */
exports.getAllPosts = (req, res, next) => {
    Post.findAll()
    .then(posts => res.send(posts))
    .catch(error => res.status(400).json({ message: "There's an " + error }));
};

/**
 * Load one specific post
 */
exports.getPost = (req, res, next) => {
    const id = req.params.id;

    Post.findByPk(id)
    .then(post => {
        if (post) {
            res.send(post);
        } else {
            res.status(404).send({
                message: `cannot find Post with id ${id}`
            });
        }
    })
    .catch(error => res.status(500).json({ message: "There's an " + error }));
};

/**
 * Upload a new post
 */
exports.createPost = (req, res, next) => {
    // validate request
    if (!req.body.title) {
        res.status(400).send({
            message: "Content cannot be empty"
        });
        return;
    }

    Post.create({
        ...req.body,
        userId: req.token.userId,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    })
    .then(data => res.send(data))
    .catch(error => res.status(400).send({ message: "There's an " + error }));
    };

/**
 * Modify one specific post
 */
exports.modifyPost = (req, res, next) => {
    const id = req.params.id;

    Post.findByPk(id)
    .then(post => {
        // Verification
        if (!post) {
            return res.status(404).json({
                error: new Error('Post does not exist!')
            })
        }
        if (post.userId !== req.token.userId) {
            return res.status(403).json({
                error: new Error('Request not authorized')
            })
        }

        // Modification
        let postObject;
        if(req.file) {
            const filename = post.imageUrl.split('/images/')[1];
            fs.unlinkSync(`images/${filename}`);

            postObject = {
                ...JSON.parse(req.body.post),
                userId: req.token.userId,
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
            }
        } else {
            postObject = { ...req.body, userId: req.token.userId}
        }

        Post.update( postObject, { where: { id: id }})
        .then(post => res.status(200).json({ message: 'Post modified'}))
        .catch(error => res.status(400).json({ message: "There's an " + error }));
    })
    .catch(error => res.status(500).json({ message: "There's an " + error }));
};

/**
 * Delete one specific post
 */
exports.deletePost = (req, res, next) => {
    const id = req.params.id;

    Post.findByPk(id)
    .then(post => {
        if (!post) {
            return res.status(404).json({
                error: new Error('Post does not exist')
            })
        }
        if (post.userId !== req.token.userId) {
            return res.status(403).json({
                error: new Error('Request not authorized')
            })
        }
        const filename = post.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Post.destroy({ where: { id: id } })
            .then(() => res.status(200).json({ message: 'Post deleted'}))
            .catch(error => res.status(400).json({ error }));
        });
    })
    .catch(error => res.status(500).json({ message: "There's an " + error }));
};

/**
 * Like/dislike, or undo like/dislike a post
 */
// exports.likePost = (req, res, next) => {
//     const id = req.params.id;

//     Post.findByPk(id)
//     .then(post => {
//         const usersLiked = post.usersLiked;
//         const usersDisliked = post.usersDisliked;
//         const userId = req.token.userId;

//         switch (req.body.like) {
//             case 1:
//                 if (!usersLiked.includes(userId) && !usersDisliked.includes(userId)) {
//                     usersLiked.push(userId);
//                 }
//                 break;
//             case -1:
//                 if (!usersDisliked.includes(userId) && !usersLiked.includes(userId)) {
//                     usersDisliked.push(userId);
//                 }
//                 break;
//             case 0:
//                 if (usersLiked.includes(userId)) {
//                     usersLiked.remove(userId)}
//                     else if (usersDisliked.includes(userId)){
//                         usersDisliked.remove(userId)
//                     }
//                 break;
//         }
//         post.likes = post.usersLiked.length;
//         post.dislikes = post.usersDisliked.length;
//         post.save()
//             .then(() => res.status(201).json({ message: 'Post rated'}))
//             .catch(error => res.status(400).json({ error }));
//     })
//     .catch(error => res.status(500).json({ message: "There's an " + error }));
// }

exports.likePost = (req, res, next) => {
    const id = req.params.id;

    Post.findByPk(id)
    .then(post => {
        const usersLiked = post.usersLiked;
        const usersDisliked = post.usersDisliked;
        const userId = req.token.userId;

        switch (req.body.like) {
            case 1:
                if (!usersLiked.includes(userId) && !usersDisliked.includes(userId)) {
                    console.log(typeof(usersLiked))
                    Post.update({ usersLiked: [...usersLiked, userId]}, {
                        where: { id: id }
                    })
                }
                break;
            case -1:
                if (!usersDisliked.includes(userId) && !usersLiked.includes(userId)) {
                    Post.update({ usersDisliked: [...usersDisliked, userId]}, {
                        where: { id: id }
                    })
                }
                break;
            case 0:
                if (usersLiked.includes(userId)) {
                    usersLiked.remove(userId)}
                    else if (usersDisliked.includes(userId)){
                        usersDisliked.remove(userId)
                    }
                break;
        }
        post.likes = post.usersLiked.length;
        post.dislikes = post.usersDisliked.length;
        post.save()
            .then(() => res.status(201).json({ message: 'Post rated'}))
            .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ message: "There's an " + error }));
}