const Cripto8_Rotor = require('./cripto8/rotor');
const ArDVK64 = require('./ArDVK64/ArDVK-64');
const NodeRSA = require('node-rsa');
const keyManager = require('./keyManager');
const cripto8 = require('./cripto8/cripto8');
const rsa = require('./rsa/utils');

let keys = null;
let arg = null;
if (process.argv[2]) arg = process.argv[2];
if (arg == '-k') {
    keys = keyManager.buildKeys();
    keyManager.storeKeys(keys);
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
if (arg == '-h') showHelp();
if (arg != '-k' && arg != '-e' && arg != '-d' && arg != '-h') {
    console.log('Invalid argument')
    showHelp();
}

async function runEncrypt(plain) {
    const keys = await keyManager.loadKeys();
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
    const keys = await keyManager.loadKeys();
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

function showHelp() {
    console.log('Command line arguments:\n');
    console.log('Generate Keys:\t-k\t[r1k] [r1s] [r2k] [r2s] [r3k] [r3s]');
    console.log('\t[r1k]: A number between 1 and 26');
    console.log('\t[r1s]: A letter');
    console.log('\t[r2k]: A number between 1 and 26');
    console.log('\t[r2s]: A letter');
    console.log('\t[r3k]: A number between 1 and 26');
    console.log('\t[r3s]: A letter');
    console.log('\tExample: node cripto -k 9 s 12 k 23 o\n');
    console.log('Encrypt:\t-e\t[plain_text]');
    console.log('\tExample: node cripto -e "Hello"\n');
    console.log('Decrypt:\t-d\t[encrypted_text]');
    console.log('\tExample: node cripto -d LBPS0iwVI04rC1Sv=');
}

function showInputError() {
    console.log('Invalid input');
    console.log('Type "node cripto -h" for help');
    process.exit();
}