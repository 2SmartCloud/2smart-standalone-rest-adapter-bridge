const ServiceBase         = require('./../BaseService');

const topicsManager = global.topicsManager;

class TopicsGet extends ServiceBase {
    static validationRules = {
        to : [ 'required', { or: [ [ 'string', 'mqtt_topic_object' ], { list_of: [ 'string', 'mqtt_topic_object' ] } ] } ]
    };

    async execute({ to }) {
        if (!Array.isArray(to)) to = [ to ];

        let topics = {};

        // eslint-disable-next-line no-unused-vars
        for (const t of to) topics = { ... topics, ...topicsManager.getTopics(t) };

        return {
            status : 1,
            data   : { topics }
        };
    }
}

module.exports = TopicsGet;
