module.exports = {
    auth : {
        'login'    : process.env.BASIC_AUTH_LOGIN,
        'password' : process.env.BASIC_AUTH_PASSWORD
    },
    allowedTopicsToRetrieveValidEntities : [ '#', 'sweet-home/#', 'sweet-home/+/#' ]
};
