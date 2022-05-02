var crypto = require('crypto');

function generateToken() {
    return crypto.randomBytes(20).toString('hex');
}

function generateHash(source) {
    return crypto.createHash('sha256').update(source).digest('base64');
}

module.exports = {
    generateToken,
    generateHash
}