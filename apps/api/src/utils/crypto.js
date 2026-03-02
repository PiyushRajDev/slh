"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptToken = encryptToken;
exports.decryptToken = decryptToken;
var crypto_1 = require("crypto");
var ALGORITHM = "aes-256-cbc";
var IV_LENGTH = 16;
function getKey() {
    var raw = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
    if (!raw || raw.length !== 32) {
        throw new Error("GITHUB_TOKEN_ENCRYPTION_KEY must be exactly 32 characters");
    }
    return Buffer.from(raw, "utf8");
}
function encryptToken(plaintext) {
    var iv = (0, crypto_1.randomBytes)(IV_LENGTH);
    var cipher = (0, crypto_1.createCipheriv)(ALGORITHM, getKey(), iv);
    var encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);
    return "".concat(iv.toString("hex"), ":").concat(encrypted.toString("hex"));
}
function decryptToken(encrypted) {
    var _a = encrypted.split(":"), ivHex = _a[0], encryptedHex = _a[1];
    var iv = Buffer.from(ivHex, "hex");
    var data = Buffer.from(encryptedHex, "hex");
    var decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, getKey(), iv);
    var decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString("utf8");
}
