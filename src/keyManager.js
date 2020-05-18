const Cripto8_Rotor = require('./cripto8/rotor');
const ArDVK64 = require('./ArDVK64/ArDVK-64');
const rsa = require('./rsa/utils');
const fs = require('fs');

function buildKeys() {
    for (let i = 3; i < 9; i++) if (!process.argv[i]) showKeyError();
    const r1k = Number(process.argv[3]);
    const r1s = process.argv[4].toLowerCase();
    const r2k = Number(process.argv[5]);
    const r2s = process.argv[6].toLowerCase();
    const r3k = Number(process.argv[7]);
    const r3s = process.argv[8].toLowerCase();
    if (!isLetter(r1s) || !isLetter(r2s) || !isLetter(r3s)) showKeyError();
    const ardvk = new ArDVK64();
    const RSA_keys = rsa.getKeys(1024);
    const private = RSA_keys.exportKey('pkcs1-private-pem');
    const public = RSA_keys.exportKey('pkcs8-public-pem');
    return {
        rsa_public: public,
        rsa_private: private,
        r1: new Cripto8_Rotor(r1k, r1s),
        r2: new Cripto8_Rotor(r2k, r2s),
        r3: new Cripto8_Rotor(r3k, r3s),
        pos: ardvk.getRandomKey()
    }
}

function storeKeys(keys) {
    let to_write = keys.rsa_private;
    to_write += '\n' + keys.rsa_public;
    to_write += '\nr1k: ' + keys.r1.key;
    to_write += '\nr1s: ' + keys.r1.showing;
    to_write += '\nr2k: ' + keys.r2.key;
    to_write += '\nr2s: ' + keys.r2.showing;
    to_write += '\nr3k: ' + keys.r3.key;
    to_write += '\nr3s: ' + keys.r3.showing;
    to_write += '\npos: ' + keys.pos;
    fs.writeFile('criptoKeys.key', to_write, function (err) {
        if (err) return console.log('Error while saving keys: ', err);
        console.log('Keys stored at criptoKeys.key');
        process.exit();
    });
}

async function loadKeys() {
    if (!existKey()) showNoKeyError();
    let data = fs.readFileSync('criptoKeys.key', 'utf8');
    if (!data) return console.log('Error while loading keys');
    
    let lines = data.split('\n');
    let rsa_private = new String();
    let rsa_public = new String();
    let r1k = null;
    let r1s = null;
    let r2k = null;
    let r2s = null;
    let r3k = null;
    let r3s = null;
    let pos = null;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i] == '-----END RSA PRIVATE KEY-----') {
            rsa_private += lines[i];
            break;
        }
        else rsa_private += lines[i] + '\n';
    }
    let get = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] == '-----BEGIN PUBLIC KEY-----') get = true;
        if (get) {
            if (lines[i] == '-----END PUBLIC KEY-----') {
                rsa_public += lines[i];
                break;
            }
            else rsa_public += lines[i] + '\n';
        }
    }
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('r1k: ')) r1k = Number(lines[i].split('r1k: ')[1]);
        if (lines[i].startsWith('r1s: ')) r1s = lines[i].split('r1s: ')[1];
        if (lines[i].startsWith('r2k: ')) r2k = Number(lines[i].split('r2k: ')[1]);
        if (lines[i].startsWith('r2s: ')) r2s = lines[i].split('r2s: ')[1];
        if (lines[i].startsWith('r3k: ')) r3k = Number(lines[i].split('r3k: ')[1]);
        if (lines[i].startsWith('r3s: ')) r3s = lines[i].split('r3s: ')[1];
        if (lines[i].startsWith('pos: ')) pos = lines[i].split('pos: ')[1];
    }

    return {
        rsa_private: rsa_private,
        rsa_public: rsa_public,
        r1: new Cripto8_Rotor(r1k, r1s),
        r2: new Cripto8_Rotor(r2k, r2s),
        r3: new Cripto8_Rotor(r3k, r3s),
        pos: pos
    }
}

function existKey() {
    return fs.existsSync('criptoKeys.key');
}

function showKeyError() {
    console.log('Error: Invalid key arguments');
    console.log('Type "node cripto -h" for help');
    process.exit();
}

function showNoKeyError() {
    console.log("Error: You don't have a key file. Please create one before");
    console.log('Type "node cripto -h" for help');
    process.exit();
}

function isLetter(str) {
    if (str.length === 1 && str.match(/[a-z]/i)) return true;
    else return false;
}

module.exports = {buildKeys, storeKeys, loadKeys}