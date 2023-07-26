const chista = require('../chista');

const TopicsGet = require('../services/topics/Get');
const TopicsSet = require('../services/topics/Set');

module.exports = {
    get : chista.makeServiceRunner(TopicsGet, req => req.query),
    set : chista.makeServiceRunner(TopicsSet, req => req.body)
};
