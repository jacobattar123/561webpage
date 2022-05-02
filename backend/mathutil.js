var crypto = require('crypto');


//generate access token
function generateToken() {
    return crypto.randomBytes(20).toString('hex');
}

//generating the password hash
function generateHash(source) {
    return crypto.createHash('sha256').update(source).digest('base64');
}

module.exports = {
    generateToken,
    generateHash
}