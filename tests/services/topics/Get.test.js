let TopicsGet;
const TopicsManager     = require('../../../lib/TopicsManager');


jest.setTimeout(30000);

let topicsManager;

describe('TopicsGet service', () => {
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
        TopicsGet = require('../../../lib/services/topics/Get');
    });


    test('NEGATIVE: get topic NOT_INITIALIZED', async () => {
        const service = new TopicsGet({ context: {} });

        try {
            await service.run({ to: 'a/b/c' });
            throw new Error('no error');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_INITIALIZED');
        }
    });
    test('NEGATIVE: get topic NOT_CONNECTED', async () => {
        topicsManager.initialized = true;
        const service = new TopicsGet({ context: {} });

        try {
            await service.run({ to: 'a/b/c' });
            throw new Error('no error');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_CONNECTED');
        }
    });
    test('NEGATIVE: get topic NOT_SYNCED', async () => {
        topicsManager.homie.online = true;
        const service = new TopicsGet({ context: {} });

        try {
            await service.run({ to: 'a/b/c' });
            throw new Error('no error');
        } catch (e) {
            // eslint-disable-next-line jest/no-try-expect
            expect(e.code).toEqual('NOT_SYNCED');
        }
    });
    test('POSITIVE: set up topics', async () => {
        topicsManager.homie.synced = true;
        topicsManager.handleMessage('a/b/c', Buffer.from('data1'));
        topicsManager.handleMessage('z/x/c', Buffer.from('data2'));
        topicsManager.handleMessage('a/b/d', Buffer.from('data3'));
        topicsManager.handleMessage('a/w/d', Buffer.from('data4'));
        topicsManager.handleMessage('a/z/c', Buffer.from('data5'));

        expect(topicsManager.topics).toEqual({
            'a/b/c' : 'data1',
            'z/x/c' : 'data2',
            'a/b/d' : 'data3',
            'a/w/d' : 'data4',
            'a/z/c' : 'data5'
        });
    });

    test('POSITIVE: get topic', async () => {
        const service = new TopicsGet({ context: {} });

        const res = await service.run({ to: 'a/b/c' });

        expect(res).toEqual({
            status : 1,
            data   : {
                topics : {
                    'a/b/c' : 'data1'
                }
            }
        });
    });


    test('POSITIVE: get topic by wildcard', async () => {
        expect(await new TopicsGet({ context: {} }).run({ to: 'a/b/+' })).toEqual({
            status : 1,
            data   : {
                topics : {
                    'a/b/c' : 'data1',
                    'a/b/d' : 'data3'
                }
            }
        });
        expect(await new TopicsGet({ context: {} }).run({ to: 'a/+/c' })).toEqual({
            status : 1,
            data   : {
                topics : {
                    'a/b/c' : 'data1',
                    'a/z/c' : 'data5'
                }
            }
        });
        expect(await new TopicsGet({ context: {} }).run({ to: 'a/b/#' })).toEqual({
            status : 1,
            data   : {
                topics : {
                    'a/b/c' : 'data1',
                    'a/b/d' : 'data3'
                }
            }
        });
        expect(await new TopicsGet({ context: {} }).run({ to: 'a/#' })).toEqual({
            status : 1,
            data   : {
                topics : {
                    'a/b/c' : 'data1',
                    'a/b/d' : 'data3',
                    'a/w/d' : 'data4',
                    'a/z/c' : 'data5'
                }
            }
        });
        expect(await new TopicsGet({ context: {} }).run({ to: '#' })).toEqual({
            status : 1,
            data   : {
                topics : {
                    'a/b/c' : 'data1',
                    'z/x/c' : 'data2',
                    'a/b/d' : 'data3',
                    'a/w/d' : 'data4',
                    'a/z/c' : 'data5'
                }
            }
        });
        expect(await new TopicsGet({ context: {} }).run({ to: 'a/b/+' })).toEqual({
            status : 1,
            data   : {
                topics : {
                    'a/b/c' : 'data1',
                    'a/b/d' : 'data3'
                }
            }
        });
        topicsManager.handleMessage('a', Buffer.from('data6'));
        expect(await new TopicsGet({ context: {} }).run({ to: '+/+/+' })).toEqual({
            status : 1,
            data   : {
                topics : {
                    'a/b/c' : 'data1',
                    'z/x/c' : 'data2',
                    'a/b/d' : 'data3',
                    'a/w/d' : 'data4',
                    'a/z/c' : 'data5'
                }
            }
        });
        expect(await new TopicsGet({ context: {} }).run({ to: '+' })).toEqual({
            status : 1,
            data   : {
                topics : {
                    'a' : 'data6'
                }
            }
        });
        topicsManager.handleMessage('a', Buffer.from(''));
    });
    test('POSITIVE: delete topics', async () => {
        topicsManager.handleMessage('a/b/c', Buffer.from(''));
        topicsManager.handleMessage('z/x/c', Buffer.from(''));
        topicsManager.handleMessage('a/b/d', Buffer.from(''));
        topicsManager.handleMessage('a/w/d', Buffer.from(''));
        topicsManager.handleMessage('a/z/c', Buffer.from(''));

        expect(topicsManager.topics).toEqual({});
    });
});
