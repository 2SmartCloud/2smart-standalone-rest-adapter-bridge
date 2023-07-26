/* eslint-disable key-spacing */
let EntitiesListDevices;
const TopicsManager     = require('../../../lib/TopicsManager');


jest.setTimeout(30000);

let topicsManager;
// eslint-disable-next-line jest/no-mocks-import
const topics = require('../../fixtures/__mocks__/devices');

// eslint-disable-next-line max-lines-per-function
describe('EntitiesListDevices service', () => {
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
        EntitiesListDevices = require('../../../lib/services/entities/ListDevices');
        topicsManager.initialized = true;
        topicsManager.homie.online = true;
        topicsManager.homie.synced = true;
        for (const [ topic, value ] of Object.entries(topics)) {
            // topicsManager.transport.emit('message', topic, Buffer.from(value));
            topicsManager.homie._handleMessage(topic, Buffer.from(value));
        }
    });


    test('POSITIVE: get list of devices only_ids', async () => {
        const service = new EntitiesListDevices({ context: {} });

        const res = await service.run({ only_ids: true });

        expect(res).toEqual({
            status: 1,
            data: {
                devices: [
                    'test-device-2',
                    'test-device',
                    'dynamic-device'
                ]
            }
        });
    });

    test('POSITIVE: get list of devices', async () => {
        const service = new EntitiesListDevices({ context: {} });

        const res = await service.run({ only_ids: false });

        expect(res.data.devices.map((d) => d.id)).toEqual([
            'test-device-2',
            'test-device',
            'dynamic-device'
        ]);
    });
});
