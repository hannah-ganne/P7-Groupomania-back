const CryptoJS = require('crypto-js');

const key = CryptoJS.enc.Hex.parse(process.env.CRYPTOJS_SECRET_KEY);
const iv = CryptoJS.enc.Hex.parse(process.env.CRYPTOJS_IV);

exports.encrypt = input => {

    return CryptoJS.AES.encrypt(input, key, { iv : iv }).toString();
};

exports.decrypt = input => {

    const decrypted = CryptoJS.AES.decrypt(input, key, {iv: iv});
    return decrypted.toString(CryptoJS.enc.Utf8);
}