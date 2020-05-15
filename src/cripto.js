const Cripto8_Rotor = require('./cripto8/rotor');
const ArDVK64 = require('./ArDVK64/ArDVK-64');
const cripto8 = require('./cripto8/cripto8');
const rsa = require('./rsa/utils');
const fs = require('fs');

let plain = 'Lorem ipsum'
const ardvk = new ArDVK64();
if (process.argv[2]) plain = process.argv[2];
if (plain == '-k') buildKeys()

console.log('Plain text: ', plain);

//Keys
const RSA_keys = rsa.getKeys(1024);
const r1k = 5;
const r1s = 'p'
const r2k = 4;
const r2s = 'o'
const r3k = 1;
const r3s = 's'

//let enc = encrypt(plain);
let enc = encrypt(plain);
console.log('\nEncrypted: ', enc);
let dec = decrypt(enc);
console.log('\nDecrypted: ', dec);

function buildKeys() {
    const r1k = Number(process.argv[3]);
    const r1s = process.argv[4];
    const r2k = Number(process.argv[5]);
    const r2s = process.argv[6];
    const r3k = Number(process.argv[7]);
    const r3s = process.argv[8];
    if (!r1k || !r1s || !r2k || !r2s || !r3k || !r3s) {
        console.log('Invalid key arguments');
        process.exit()
    }
    const RSA_keys = rsa.getKeys(1024);
    const private = RSA_keys.exportKey('pkcs1-private-pem');
    const public = RSA_keys.exportKey('pkcs8-public-pem');
    const keys = {
        rsa_public: public,
        rsa_private: private,
        r1: new Cripto8_Rotor(r1k, r1s),
        r2: new Cripto8_Rotor(r2k, r2s),
        r3: new Cripto8_Rotor(r3k, r3s),
        pos: ardvk.getRandomKey()
    }
    //fs.writeSync('cripto_keys.key', JSON.stringify(keys));
    console.log(keys)
}

function encrypt(plain) {
    const c8enc = encryptCripto8(plain);
    const ArDVKenc = ardvk.encode(c8enc);
    return rsa.encrypt(ArDVKenc, RSA_keys);
}

function decrypt(input) {
    const ArDVKout = rsa.decrypt(input, RSA_keys);
    const c8out = ardvk.decode(ArDVKout);
    return decryptCripto8(c8out);
}

function decryptCripto8(ent) {
    let r1 = new Cripto8_Rotor(r1k, r1s);
    let r2 = new Cripto8_Rotor(r2k, r2s);
    let r3 = new Cripto8_Rotor(r3k, r3s);
    return cripto8.decode(ent, r1, r2, r3); 
}

function encryptCripto8(ent) {
    let r1 = new Cripto8_Rotor(r1k, r1s);
    let r2 = new Cripto8_Rotor(r2k, r2s);
    let r3 = new Cripto8_Rotor(r3k, r3s);
    return cripto8.encode(ent, r1, r2, r3);
}