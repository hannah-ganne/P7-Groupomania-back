const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const postCtrl = require('../controllers/Post');

// const userCtrl = require('../controllers/User')

router.post('/', auth, multer, postCtrl.createPost);
router.get('/', auth, postCtrl.getAllPosts);
router.get('/all/:sort', auth, postCtrl.sortPosts);
router.get('/:id', auth, postCtrl.getPost);
router.put('/:id', auth, multer, postCtrl.modifyPost);
router.delete('/:id', auth, postCtrl.deletePost);
router.get('/department/:department', auth, postCtrl.filterByDept);
router.get('/topic/:topic', auth, postCtrl.filterByTopic);
router.get('/search/:keyword', auth, postCtrl.searchPosts);
router.get('/user/:userId', auth, postCtrl.getPostsByUser);

// router.post('/:id/like', auth, postCtrl.likePost);
// router.get('/:id/viewProfile', auth, userCtrl.viewProfile);

module.exports = router; 