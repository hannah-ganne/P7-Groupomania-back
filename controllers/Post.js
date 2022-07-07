const Post = require('../models/post.js');
const Like = require('../models/likes');
const fs = require('fs');
const { send } = require('process');
const Comment = require('../models/comment')
const User = require('../models/user');
const { post } = require('../app.js');

/**
 * Load all the posts
 */
exports.getAllPosts = (req, res, next) => {
    switch (req.body.sort) {
        case 0:
            Post.findAll({
                order: [
                    ['createdAt', 'desc']
                ]
            })
            .then(posts => res.send(posts))
            .catch(error => res.status(400).json({ message: "There's an " + error }));
            break;
        
        case 1:
            Post.findAll({
                order: [
                    ['createdAt', 'asc']
                ]
            })
                .then(posts => res.send(posts))
                .catch(error => res.status(400).json({ message: "There's an " + error }));
            break;
            
        case 2:
            Post.findAll({
                include: [
                    { model: User, attributes: ['firstName', 'department', 'imageUrl'] },
                    { model: Comment},
                    { model: Like }
            ] })
                .then(posts => res.send(posts))
                .catch(error => res.status(400).json({ message: "There's an " + error }));
            break;
            
        default:
            Post.findAll()
            .then(posts => res.send(posts))
            .catch(error => res.status(400).json({ message: "There's an " + error }));
            break;
    }

}

/**
 * Load one specific post
 */
exports.getPost = (req, res, next) => {
    const id = req.params.id;


    Post.findByPk(id, {
        include: [
            { model: Comment, include: [{ model: User, attributes: ['firstName', 'lastName', 'imageUrl'] }]},
            { model: User, attributes: ['firstName', 'lastName', 'imageUrl', 'department', 'expertIn', 'interestedIn', 'oneWord', 'isUpFor'] },
            { model: Like }
        ]
    })
        .then(post => {

            if (post) {
                const likeTotal = post.countLikes({ where: { like: 1 } })
                const dislikeTotal = post.countLikes({ where: { like: -1 } })
                const commentTotal = post.countComments()

                Promise.all([likeTotal, dislikeTotal, commentTotal])
                        .then(values => {
                        res.send({
                            post: post,
                            likeTotal: values[0],
                            dislikeTotal: values[1],
                            commentTotal: values[2]
                        })
                })

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