# Cripto Extreme Edition 3.0

Cripto Extreme Edition is a strong command line text encryptor that uses assimetric keys. It's mainly based on RSA Algorithm and two others encrypt algorithms written by me: Cripto 8.0 (https://github.com/ErickOliveiraT/Cripto-8.0) and ArDVK-64 (https://github.com/ErickOliveiraT/ArDVK-64).

## Usage:

### Generating key file:
```sh
$ node cripto -k [r1k] [r1s] [r2k] [r2s] [r3k] [r3s]
```
[r1k], [r2k] and [r3k]: A number between 1 and 26
[r1s], [r2s] and [r2s]: A letter

Example: 

```sh
$ node cripto -k 9 s 12 k 23 o
$ Keys stored at criptoKeys.key
```

### Encrypt:
```sh
$ node cripto -e "[plain_text]"
```
[plain_text] Your input text to encrypt

Example: 

```sh
$ node cripto "Hello world!"
$ LBPS0iwVsasdibYAS4rC1Sv=
```

### Decrypt:
```sh
$ node cripto -d [encrypted_text]

```
[encrypted_text] Your encrypted text to be decrypted

Example: 

```sh
$ node cripto -d LBPS0iwVsasdibYAS4rC1Sv=
$ Hello world!
```