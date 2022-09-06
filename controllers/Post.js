const Post = require('../models/post');
const Like = require('../models/likes');
const fs = require('fs');
const { send } = require('process');
const Comment = require('../models/comment')
const User = require('../models/user');
// const { post } = require('../app.js');
const db = require('../config/database.js');
const AES = require('../utils/AES')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

/**
 * Sort posts
 */
exports.sortPosts = (req, res, next) => {
    let sort = req.params.sort ?? 0;
    let sortArray = [['createdAt', 'desc'], ['createdAt', 'asc'], [db.literal('likesCount'), 'DESC']
]

    Post.findAll({
        include: {
                    model: User,
                    attributes: ['firstName', 'department', 'imageUrl']
                },
        attributes: 
            {
            include: [
                [
                    db.literal(`(
                        SELECT COUNT(*)
                        FROM likes AS likes
                        WHERE
                            likes.postId = post.id
                            AND
                            likes.type = 1
                    )`),
                    'likesCount'
                    ],
                [
                    db.literal(`(
                        SELECT COUNT(*)
                        FROM comment AS comments
                        WHERE
                            comments.postId = post.id
                    )`),
                    'commentsCount'
                ]
            ]
        },
        order: [sortArray[sort]]
    })
        .then(posts => res.send(posts))
        .catch(error => res.status(400).json({ message: "There's an " + error }));
}

exports.getAllPosts = (req, res, next) => {

    Post.findAll({
        include: {
                    model: User,
                    attributes: ['firstName', 'department', 'imageUrl']
                },
        attributes: 
            {
            include: [
                [
                    db.literal(`(
                        SELECT COUNT(*)
                        FROM likes AS likes
                        WHERE
                            likes.postId = post.id
                            AND
                            likes.type = 1
                    )`),
                    'likesCount'
                    ],
                [
                    db.literal(`(
                        SELECT COUNT(*)
                        FROM comment AS comments
                        WHERE
                            comments.postId = post.id
                    )`),
                    'commentsCount'
                ]
            ]
        },
        order: [['createdAt', 'desc']]
    })
        .then(posts => res.send(posts))
        .catch(error => res.status(400).json({ message: "There's an " + error }));
}

/**
 * Load one specific post
 */
exports.getPost = (req, res, next) => {
    const id = req.params.id;


    Post.findByPk(id, {
        include: [
            { model: Comment, include: [{ model: User, attributes: ['firstName', 'lastName', 'imageUrl'] }]},
            { model: User, attributes: ['firstName', 'lastName', 'email', 'imageUrl', 'department', 'expertIn', 'interestedIn', 'oneWord', 'isUpFor'] },
            { model: Like }
        ]
    })
        .then(post => {

            if (post) {
                const likesCount = post.countLikes({ where: { type: 1 } })
                const dislikesCount = post.countLikes({ where: { type: -1 } })
                const commentsCount = post.countComments()
                let alreadyLiked = 0;

                Like.findOne({ where: { postId: id, userId: req.token.userId } })
                    .then(like => {
                    
                    if (like) {
                        alreadyLiked = like.type;
                    }
                        
                    Promise.all([likesCount, dislikesCount, commentsCount])
                    .then(values => {
                    res.send({
                        post: post,
                        email: AES.decrypt(post.user.email), 
                        likesCount: values[0],
                        dislikesCount: values[1],
                        commentsCount: values[2],
                        alreadyLiked
                    })
            })
                })
                .catch(err => console.log(err))

        } else {
            res.status(404).send({
                message: `cannot find Post with id ${id}`
            });
        }
    })
    .catch(error => res.status(500).json({ message: "There's an " + error }));
};

exports.getPostsByUser = (req, res, next) => {
    Post.findAll({ where: { userId: req.params.userId } })
    .then(posts => res.send(posts))
    .catch(error => res.status(400).json({ message: "There's an " + error }));
}

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

    const imageUrl = req.file && `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

    if (req.body.title && req.body.topic && req.body.description) {
        Post.create({
            ...req.body,
            userId: req.token.userId,
            imageUrl: imageUrl
        })
        .then(data => res.send(data))
        .catch(error => res.status(400).send({ message: "There's an " + error }));
    }
    };

/**
 * Modify one specific post
 */
exports.modifyPost = (req, res, next) => {
    const id = req.params.id;

    console.log(req.body)

    Post.findByPk(id)
        .then(post => {
            // Verification
            if (!post) {
                return res.status(404).json({
                    error: new Error('Post does not exist!')
                })
            }

            if (post.userId === req.token.userId || req.token.isAdmin) {
                let postObject;
                if (req.file) {
                    const filename = post.imageUrl.split('/images/')[1];
                    fs.unlinkSync(`images/${filename}`);

                    postObject = {
                        ...req.body,
                        // userId: req.token.userId,
                        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                    }
                } else {
                    postObject = { ...req.body}
                }

                Post.update(postObject, { where: { id: id } })
                    .then(post => res.status(200).json({ message: 'Post modified' }))
                    .catch(error => res.status(400).json({ message: "There's an " + error }));
            } else {
                return res.status(403).json({
                    error: new Error('Request not authorized')
                })
            }
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

        if (post.userId !== req.token.userId && !req.token.isAdmin) {
            return res.status(403).json({
                error: new Error('Request not authorized')
            })
        } else if (post.userId === req.token.userId || req.token.isAdmin) {
            if(req.file) {
                const filename = post.imageUrl.split('/images/')[1];
                fs.unlinkSync(`images/${filename}`);
            }
    
            Post.destroy({ where: { id: id } })
                .then(() => res.status(200).json({ message: 'Post deleted'}))
                .catch(error => res.status(400).json({ error }));
        }
        })
        .catch(error => res.status(500).json({ message: "There's an " + error }));


};

exports.filterByDept = (req, res, next) => {

    let sort = req.params.sort ?? 0;
    let sortArray = [['createdAt', 'desc'], ['createdAt', 'asc'], [db.literal('likesCount'), 'DESC']]

        Post.findAll({
            include: {
                model: User,
                attributes: ['firstName', 'department', 'imageUrl'],
                where: {department: req.params.department}
                },
            attributes: 
                {
                include: [
                    [
                        db.literal(`(
                            SELECT COUNT(*)
                            FROM likes AS likes
                            WHERE
                                likes.postId = post.id
                                AND
                                likes.type = 1
                        )`),
                        'likesCount'
                        ],
                    [
                        db.literal(`(
                            SELECT COUNT(*)
                            FROM comment AS comments
                            WHERE
                                comments.postId = post.id
                        )`),
                        'commentsCount'
                    ]
                ]
            },
            order: [sortArray[sort]]
        })
        .then(posts => res.send(posts))
        .catch(error => res.status(400).json({ message: "There's an " + error }));
}

exports.filterByTopic = (req, res, next) => {

    let sort = req.params.sort ?? 0;
    let sortArray = [['createdAt', 'desc'], ['createdAt', 'asc'], [db.literal('likesCount'), 'DESC']]

    Post.findAll({
            where: {
                topic: req.params.topic
                }, 
            include: {
                model: User,
                attributes: ['firstName', 'department', 'imageUrl'],
                },
            attributes: 
                {
                include: [
                    [
                        db.literal(`(
                            SELECT COUNT(*)
                            FROM likes AS likes
                            WHERE
                                likes.postId = post.id
                                AND
                                likes.type = 1
                        )`),
                        'likesCount'
                        ],
                    [
                        db.literal(`(
                            SELECT COUNT(*)
                            FROM comment AS comments
                            WHERE
                                comments.postId = post.id
                        )`),
                        'commentsCount'
                    ]
                ]
            },
            order: [sortArray[sort]]
        })
        .then(posts => res.send(posts))
        .catch(error => res.status(400).json({ message: "There's an " + error }));
}

exports.searchPosts = (req, res, next) => {

let searchKeyword = req.params.keyword.toLowerCase();

Post.findAll({
    where: {
        [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + searchKeyword + '%'),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('description')), 'LIKE', '%' + searchKeyword + '%')
        ]
    },
    include: {
        model: User,
        attributes: ['firstName', 'department', 'imageUrl']
    },
    attributes: 
            {
            include: [
                [
                    db.literal(`(
                        SELECT COUNT(*)
                        FROM likes AS likes
                        WHERE
                            likes.postId = post.id
                            AND
                            likes.type = 1
                    )`),
                    'likesCount'
                    ],
                [
                    db.literal(`(
                        SELECT COUNT(*)
                        FROM comment AS comments
                        WHERE
                            comments.postId = post.id
                    )`),
                    'commentsCount'
                ]
            ]
        }
})
    .then(posts => res.send(posts))
    .catch(error => res.status(400).json({ message: "There's an " + error }));
}