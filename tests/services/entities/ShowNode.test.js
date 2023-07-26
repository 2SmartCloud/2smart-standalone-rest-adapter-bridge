/* eslint-disable key-spacing */
let EntitiesShowNode;
const TopicsManager     = require('../../../lib/TopicsManager');


jest.setTimeout(30000);

let topicsManager;
// eslint-disable-next-line jest/no-mocks-import
const topics = require('../../fixtures/__mocks__/devices');

// eslint-disable-next-line max-lines-per-function
describe('EntitiesShowNode service', () => {
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
        EntitiesShowNode = require('../../../lib/services/entities/ShowNode');
        topicsManager.initialized = true;
        topicsManager.homie.online = true;
        topicsManager.homie.synced = true;
        for (const [ topic, value ] of Object.entries(topics)) {
            // topicsManager.transport.emit('message', topic, Buffer.from(value));
            topicsManager.homie._handleMessage(topic, Buffer.from(value));
        }
    });


    test('POSITIVE: get node', async () => {
        const service = new EntitiesShowNode({ context: {} });

        const res = await service.run({ deviceId: 'test-device', nodeId: 'controls' });

        expect(res.data.node.id).toEqual('controls');
    });

    test('NEGATIVE: get node of nonexistent device', async () => {
        const service = new EntitiesShowNode({ context: {} });

        try {
            await service.run({ deviceId: 'test-nonexistent-device', nodeId: 'controls' });
            throw new Error('error expected');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_FOUND');
        }
    });
    test('NEGATIVE: get nonexistent node', async () => {
        const service = new EntitiesShowNode({ context: {} });

        try {
            await service.run({ deviceId: 'test-device', nodeId: 'nonexistent-node'  });
            throw new Error('error expected');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_FOUND');
        }
    });
});
