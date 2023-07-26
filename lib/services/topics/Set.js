const X = require('../../repaired_chista_exception');
const ServiceBase         = require('./../BaseService');

const topicsManager = global.topicsManager;

class TopicsGet extends ServiceBase {
    static validationRules = {
        topics : [ 'required', 'any_object', 'topics_object' ]
    };

    async execute({ topics }) {
        const topicsResults = {};
        const errorTopics = {};

        await Promise.all(Object.entries(topics).map(([ topic, value ]) => {
            return topicsManager.set(topic, value).then((result) => {
                topicsResults[topic] = result;
            }, (e) => {
                errorTopics[topic] = ((e instanceof X)?e:new X(e)).toHash();
            });
        }));

        return {
            status : 1,
            data   : {
                topics : topicsResults,
                errorTopics
            }
        };
    }
}

module.exports = TopicsGet;
