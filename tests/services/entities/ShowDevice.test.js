/* eslint-disable key-spacing */
let EntitiesShowDevice;
const TopicsManager     = require('../../../lib/TopicsManager');


jest.setTimeout(30000);

let topicsManager;
// eslint-disable-next-line jest/no-mocks-import
const topics = require('../../fixtures/__mocks__/devices');

// eslint-disable-next-line max-lines-per-function
describe('EntitiesShowDevice service', () => {
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
        EntitiesShowDevice = require('../../../lib/services/entities/ShowDevice');
        topicsManager.initialized = true;
        topicsManager.homie.online = true;
        topicsManager.homie.synced = true;
        for (const [ topic, value ] of Object.entries(topics)) {
            // topicsManager.transport.emit('message', topic, Buffer.from(value));
            topicsManager.homie._handleMessage(topic, Buffer.from(value));
        }
    });


    test('POSITIVE: get device', async () => {
        const service = new EntitiesShowDevice({ context: {} });

        const res = await service.run({ deviceId: 'test-device' });

        expect(res.data.device.id).toEqual('test-device');
    });

    test('NEGATIVE: get nonexistent device', async () => {
        const service = new EntitiesShowDevice({ context: {} });

        try {
            await service.run({ deviceId: 'test-nonexistent-device' });
            throw new Error('error expected');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_FOUND');
        }
    });
});
