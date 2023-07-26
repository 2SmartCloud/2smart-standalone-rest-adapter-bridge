const EventEmitter  = require('events');
const MQTTTransport = require('homie-sdk/lib/Broker/mqtt');
const Homie         = require('homie-sdk/lib/homie/Homie');
const _             = require('underscore');

const { ERROR_TOPIC } = require('homie-sdk/lib/homie/Homie/config');
const X               = require('./repaired_chista_exception');

const { ERROR_CODES } = require('./errors');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

class TopicsManager extends EventEmitter {
    constructor({ mqttConnection, allowedTopics = '#' }) {
        super();
        this.handleMessage = this.handleMessage.bind(this);
        const transport = new MQTTTransport(_.defaults({ ...mqttConnection }, {
            username : '',
            password : '',
            uri      : 'mqtt://localhost:1883'
        }));
        const homie = new Homie({ transport });

        this.initialized = false;
        this.online = false;
        this.topics = {};
        this.transport = transport;
        this.homie = homie;
        this.transport.on('message', this.handleMessage);
        // allowed topics comes from config as comma separated string with topics
        // Example of absolute topics: "sweet-home/device-id/node-id/sensor-id,sweet-home/device-id/node-id/$options/option-id"
        // Example of topics with wildcards: "sweet-home/first-device-id/#,sweet-home/second-device-id/#"
        this.allowedTopics = allowedTopics.split(',').map(topic => topic.trim());
    }

    buildRegExpForWildcardTopic(topic) {
        const topicLevels = topic.split('/');
        const plusRegExp = '[^/]+';

        // eslint-disable-next-line more/no-c-like-loops
        for (let i = 0; i < topicLevels.length; i++) {
            if (i === topicLevels.length - 1 && topicLevels[i] === '#') {
                topicLevels[i] = `${plusRegExp}(/${plusRegExp})*`;
            }
            else if (topicLevels[i] === '+') topicLevels[i] = plusRegExp;
            else topicLevels[i] = escapeRegExp(topicLevels[i]);
        }

        // build from mqtt wildcards syntax js-RegExp object
        const regExpStr = `^${topicLevels.join('/')}$`;

        // eslint-disable-next-line security/detect-non-literal-regexp
        const regExp = new RegExp(regExpStr);

        return regExp;
    }

    isWildcardTopic(topic) {
        const topicLevels = topic.split('/');

        return topicLevels.includes('+') || topicLevels[topicLevels.length - 1] === '#';
    }

    checkAllowedTopic(topic) {
        if (!this.allowedTopics.includes(topic)) {
            const isAllowedTopic = this.allowedTopics
                .filter(this.isWildcardTopic.bind(this))
                .map(this.buildRegExpForWildcardTopic.bind(this))
                .some(allowedTopicRegExp => allowedTopicRegExp.test(topic));

            if (!isAllowedTopic) {
                throw new X({
                    code    : ERROR_CODES.ACCESS_DENIED,
                    message : 'Not allowed topic'
                });
            }
        }
    }

    getTopics(to) {
        this.checkAllowedTopic(to);

        if (!this.isWildcardTopic(to)) return { [to]: this.topics[to] };

        const regExp = this.buildRegExpForWildcardTopic(to);
        const topics = {};

        // eslint-disable-next-line no-unused-vars
        for (const topic in this.topics) {
            if (regExp.test(topic)) topics[topic] = this.topics[topic];
        }

        return topics;
    }

    getAllowedTopics() {
        return this.allowedTopics;
    }

    init() {
        // istanbul ignore next
        this.homie.init(null, this.allowedTopics).then(() => {
            this.initialized = true;
        }, (error) => {
            // istanbul ignore next
            this.emit('error', error);
            // istanbul ignore next
            this.emit('exit', error, 1);
        });
    }

    destroy() {
        this.initialized = false;
        this.homie.end();
    }

    // async
    async set(topic, value, errorTimeout = 10000) {
        this.checkAllowedTopic(topic);

        let resolve;
        let reject;

        const promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });

        const clear = () => {
            clearTimeout(tId);
            this.transport.off('message', onMessage);
        };

        const onMessage = (t, message) => {
            if (t === topic) {
                clear();
                resolve(message.toString());
            } else if (`${ERROR_TOPIC}/${topic}` === t) {
                clear();
                let error = message.toString();

                try {
                    error = new X(JSON.parse(error));
                } catch (e) {
                    error = new X(error);
                }

                reject(error);
            }
        };

        const tId = setTimeout(() => {
            clear();
            reject(new X({ code: ERROR_CODES.TIMEOUT, message: `Too long waiting for response while set the topic ${topic}` }));
        }, errorTimeout);

        this.transport.on('message', onMessage);

        this.homie.publishToBroker(`${topic}/set`, value, { retain: false });
        return promise;
    }

    // handlers~
    async handleMessage(topic, message) {
        message = message.toString();
        if (message) this.topics[topic] = message.toString();
        else delete this.topics[topic];
    }
    // ~handlers
}

module.exports = TopicsManager;
