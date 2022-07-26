const Post = require('../models/post');
const Like = require('../models/likes');
const fs = require('fs');
const { send } = require('process');
const Comment = require('../models/comment')
const User = require('../models/user');
// const { post } = require('../app.js');
const db = require('../config/database.js');
const AES = require('../utils/AES')

/**
 * Load all the posts
 */
exports.getAllPosts = (req, res, next) => {
    let sort = req.body.sort ?? 0;
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
// exports.getAllPosts = (req, res, next) => {

    // let sort = req.body.sort ?? 0;

    // let sortArray = [['createdAt', 'desc'], ['createdAt', 'asc'], '']

//     Post.findAll({
//         include: [
//             {
//                 model: User,
//                 attributes: ['firstName', 'department', 'imageUrl']
//             },
//             {
//                 model: Comment,
//                 attributes: [
//                     db.literal(`(
//                         SELECT COUNT(*)
//                         FROM comment
//                         WHERE
//                             comment.postId = post.id
//                     )`),
//                     'commentsCount'
//                 ]
//             },
//             {
//                 model: Like,
//                 attributes: [
//                     db.literal(`(
//                         SELECT COUNT(*)
//                         FROM likes
//                         WHERE
//                             likes.postId = post.id
//                     )`),
//                     'likesCount'
//                 ]
//             }
//         ],
        // order: sortArray[sort]

//     })
//         .then(posts => res.send(posts))
//         .catch(error => res.status(400).json({ message: "There's an " + error }));
// }

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

                Promise.all([likesCount, dislikesCount, commentsCount])
                        .then(values => {
                        res.send({
                            post: post,
                            email: AES.decrypt(post.user.email), 
                            likesCount: values[0],
                            dislikesCount: values[1],
                            commentsCount: values[2]
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

exports.filterByDept = (req, res, next) => {
    Post.findAll({
        include:
        {
            model: User,
            attributes: ['department'],
            where: {
                department: req.body.department
            }
        }
        
    })
        .then(posts => res.send(posts))
        .catch(error => res.status(400).json({ message: "There's an " + error }));
}

exports.filterByTopic = (req, res, next) => {
    Post.findAll({
        where: {
            topic: req.body.topic
        }
    })
        .then(posts => res.send(posts))
        .catch(error => res.status(400).json({ message: "There's an " + error }));
}

exports.searchPosts = (req, res, next) => {

let searchKeyword = req.body.keyword.toLowerCase();

Post.findAll({
    where: {
        [Op.or]: [
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), 'LIKE', '%' + searchKeyword + '%'),
            Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('description')), 'LIKE', '%' + searchKeyword + '%')
        ]
    }
})
    .then(posts => res.send(posts))
    .catch(error => res.status(400).json({ message: "There's an " + error }));
}