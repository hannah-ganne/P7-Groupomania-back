const Department = require('./department');
const Topic = require('./topic');

module.exports = async () => {
// Démarre 2 tâches en parallèle et on attend que les deux soient finies
await Promise.all([
    (async()=> await Department.create({
        name: 'Finance'
    }))(),
    (async()=> await Department.create({
        name: 'HR'
    }))(),
    (async()=> await Department.create({
        name: 'IT'
    }))(),
    (async()=> await Department.create({
        name: 'Marketing'
    }))(),
    (async()=> await Department.create({
        name: 'Operations'
    }))(),
    (async()=> await Department.create({
        name: 'Purchase'
    }))(),
    (async()=> await Department.create({
        name: 'Sales'
    }))(),
    (async()=> await Topic.create({
        name: 'News'
    }))(),
    (async()=> await Topic.create({
        name: 'Team building'
    }))(),
    (async()=> await Topic.create({
        name: 'Workflow'
    }))(),
    (async()=> await Topic.create({
        name: 'Productivity'
    }))(),
    (async()=> await Topic.create({
        name: 'Leadership'
    }))(),
    (async()=> await Topic.create({
        name: 'Communication'
    }))(),
    (async()=> await Topic.create({
        name: 'Career'
    }))(),
    (async()=> await Topic.create({
        name: 'Technology'
    }))(),
    (async()=> await Topic.create({
        name: 'Networking'
    }))(),
    (async()=> await Topic.create({
        name: 'Just for laughs'
    }))(),
    (async()=> await Topic.create({
        name: 'Suggestions'
    }))(),
    (async()=> await Topic.create({
        name: 'Insight'
    }))(),
    (async()=> await Topic.create({
        name: 'Industry'
    }))(),
    (async()=> await Topic.create({
        name: 'Events'
    }))(),
    (async()=> await Topic.create({
        name: 'Learning and development'
    }))(),
    (async()=> await Topic.create({
        name: 'Other topics'
    }))()
]);
}