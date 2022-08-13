const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const likeCtrl = require('../controllers/Like');

router.post('/:id/like', auth, likeCtrl.likePost);

module.exports = router; 