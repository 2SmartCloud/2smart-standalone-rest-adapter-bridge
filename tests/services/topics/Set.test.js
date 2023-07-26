let TopicsSet;
const EventEmitter     = require('events');
const TopicsManager     = require('../../../lib/TopicsManager');
const { ERROR_TOPIC } = require('homie-sdk/lib/homie/Homie/config');

jest.setTimeout(30000);

let topicsManager;

describe('TopicsSet service', () => {
    beforeAll(async () => {
        topicsManager = new TopicsManager({
            mqttConnection : {
                username : process.env.MQTT_USER || undefined,
                password : process.env.MQTT_PASS || undefined,
                uri      : process.env.MQTT_URI || undefined
            }
        });
        topicsManager.on('error', (e) => {
            console.log(e);
        });
        topicsManager.on('exit', (reason, exit_code) => {
            console.log('RestAdapter.exit', reason);
            process.exit(exit_code);
        });
        global.topicsManager = topicsManager;
        TopicsSet = require('../../../lib/services/topics/Set');

        topicsManager.initialized = true;
        topicsManager.homie = {
            online : true,
            synced : true,
            publishToBroker(topic, value, options) {
                if (topic.split('/').slice(-2).join('/') === 'ok/set') {
                    topicsManager.transport.emit('message', `${topic.split('/').slice(0, -1).join('/')}`, Buffer.from(value));
                } else if (topic.split('/').slice(-2).join('/') === 'error/set') {
                    topicsManager.transport.emit('message', `${ERROR_TOPIC}/${topic.split('/').slice(0, -1).join('/')}`, JSON.stringify({ code: 'UNKNOWN_ERROR' }));
                } else {
                    // nothing to do here
                }
            }
        }
        topicsManager.transport = new EventEmitter();
    });


    test('POSITIVE: set topics', async () => {
        const service = new TopicsSet({ context: {} });

        const res = await service.run({ topics : {
            'a/ok' : 'data1'
        } });

        expect(res).toEqual({
            status : 1,
            data   : {
                topics : {
                    'a/ok' : 'data1'
                },
                errorTopics : {}
            }
        });
    });
    test('NEGATIVE: set topics', async () => {
        const service = new TopicsSet({ context: {} });

        const res = await service.run({ topics : {
            'a/error' : 'data1'
        } });

        expect(res).toEqual({
            status : 1,
            data   : {
                topics      : {},
                errorTopics : {
                    'a/error' : {
                        'code'   : 'UNKNOWN_ERROR',
                        'fields' : {}
                    }
                }
            }
        });
    });
    test('NEGATIVE: set timeout', async () => {
        const service = new TopicsSet({ context: {} });

        const res = await service.run({ topics : {
            'a/timeout' : 'data1'
        } });

        expect(res).toEqual({
            status : 1,
            data   : {
                topics      : {},
                errorTopics : {
                    'a/timeout' : {
                        'code'   : 'TIMEOUT',
                        'fields' : {}
                    }
                }
            }
        });
    });
});
