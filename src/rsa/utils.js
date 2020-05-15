const NodeRSA = require('node-rsa');

function getKeys(bits) {
    return new NodeRSA({b: bits});
}

function encrypt(plain, key) {
    return key.encrypt(plain, 'base64');
}

function decrypt(enc, key) {
    return key.decrypt(enc, 'utf8');
}

module.exports = {getKeys, encrypt, decrypt}

/* const key = getKeys(1024);
const ent = 'lorem ipsum';
const enc = encrypt(ent,key);
console.log(enc);
const dec = decrypt(enc,key);
console.log(dec); */