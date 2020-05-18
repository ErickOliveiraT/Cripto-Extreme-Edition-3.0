const Cripto8_Rotor = require('./cripto8/rotor');
const ArDVK64 = require('./ArDVK64/ArDVK-64');
const NodeRSA = require('node-rsa');
const cripto8 = require('./cripto8/cripto8');
const rsa = require('./rsa/utils');
const fs = require('fs');

let ardvk = new ArDVK64();
let keys = null;
let arg = null;
if (process.argv[2]) arg = process.argv[2];
if (arg == '-k') {
    keys = buildKeys();
    storeKeys(keys);
}
if (arg == '-e') {
    let plain = null;
    if (process.argv[3]) plain = process.argv[3];
    if (!plain) showInputError();
    runEncrypt(plain);
}
if (arg == '-d') {
    let input = null;
    if (process.argv[3]) input = process.argv[3];
    if (!input) showInputError();
    runDecrypt(input);
}

async function runEncrypt(plain) {
    const keys = await loadKeys();
    let RSA_keys = new NodeRSA();
    RSA_keys.importKey(keys.rsa_private, 'pkcs1-private-pem');
    const ardvk = new ArDVK64(keys.pos);
    const r1 = new Cripto8_Rotor(keys.r1.key, keys.r1.showing);
    const r2 = new Cripto8_Rotor(keys.r2.key, keys.r2.showing);
    const r3 = new Cripto8_Rotor(keys.r3.key, keys.r3.showing);

    const c8enc = cripto8.encode(plain, r1, r2, r3);
    const ArDVKenc = ardvk.encode(c8enc);
    
    console.log(rsa.encrypt(ArDVKenc, RSA_keys));
}

async function runDecrypt(input) {
    const keys = await loadKeys();
    let RSA_keys = new NodeRSA();
    RSA_keys.importKey(keys.rsa_private, 'pkcs1-private-pem');
    const ardvk = new ArDVK64(keys.pos);
    const r1 = new Cripto8_Rotor(keys.r1.key, keys.r1.showing);
    const r2 = new Cripto8_Rotor(keys.r2.key, keys.r2.showing);
    const r3 = new Cripto8_Rotor(keys.r3.key, keys.r3.showing);

    const ArDVKout = rsa.decrypt(input, RSA_keys);
    const c8out = ardvk.decode(ArDVKout);
    
    console.log(cripto8.decode(c8out, r1, r2, r3));
}

async function loadKeys() {
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

function buildKeys() {
    const r1k = Number(process.argv[3]);
    const r1s = process.argv[4];
    const r2k = Number(process.argv[5]);
    const r2s = process.argv[6];
    const r3k = Number(process.argv[7]);
    const r3s = process.argv[8];
    if (!r1k || !r1s || !r2k || !r2s || !r3k || !r3s) showKeyError();
    if (!isLetter(r1s) || !isLetter(r2s) || !isLetter(r3s)) showKeyError();
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

function isLetter(str) {
    if (str.length === 1 && str.match(/[a-z]/i)) return true;
    else return false;
}

function showKeyError() {
    console.log('Invalid key arguments');
    console.log('Type "node cripto -h" for help');
    process.exit();
}

function showInputError() {
    console.log('Invalid input');
    console.log('Type "node cripto -h" for help');
    process.exit();
}