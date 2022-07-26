const departments = require('../models/department')
// const Topic = require('../models/list')

exports.getDepartment = (req, res) => {
    return departments
}

// exports.getTopic = (req, res, next) => {
//     Topic.findAll()
//     .then(topics => res.send(topics))
//     .catch(error => res.status(400).json({ message: "There's an " + error }));
// }