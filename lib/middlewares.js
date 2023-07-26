const cors       = require('cors');
const bodyParser = require('body-parser');
const multipart  = require('connect-multiparty');
const basicAuth = require('express-basic-auth');

module.exports = (app) => {
    app.use(bodyParser.json({
        limit  : 1024 * 1024,
        verify : (req, res, buf) => {
            try {
                JSON.parse(buf);
            } catch (e) {
                res.send({
                    status : 0,
                    error  : {
                        code    : 'BROKEN_JSON',
                        message : 'Please, verify your json'
                    }
                });
                throw new Error('BROKEN_JSON');
            }
        }
    }));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors({ origin: '*' }));// We allow any origin because we DO NOT USE cookies and basic auth
    app.use(multipart());

    const { auth } = require('../etc/config');

    if (auth.login && auth.password) {
        app.use(basicAuth({
            users                : { [auth.login]: auth.password },
            challenge            : true,
            unauthorizedResponse : (req) => {
                return {
                    status : 0,
                    error  : {
                        message : req.auth ?  'Credentials rejected' : 'No credentials provided',
                        code    : 'UNAUTHORIZED'
                    }
                };
            }
        }));
    } else if (!auth.login && !auth.password) {
        // no auth
    } else {
        // exit with error
        throw new Error('Please, provide both basic auth credentials(login and password).');
    }
};
