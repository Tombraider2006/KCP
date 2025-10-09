/**
 * Модуль для безопасного шифрования/дешифрования чувствительных данных
 * Использует встроенный модуль crypto Node.js с AES-256-GCM
 */

const crypto = require('crypto');
const { app } = require('electron');

// Алгоритм шифрования
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Получает или создаёт уникальный ключ шифрования для этой установки
 * Ключ привязан к конкретной машине и пользователю
 */
function getEncryptionKey() {
    const Store = require('electron-store');
    const store = new Store({ name: 'security' });
    
    let key = store.get('encryptionKey');
    
    if (!key) {
        // Создаём новый ключ на основе уникальных данных машины
        const machineId = app.getPath('userData');
        const randomBytes = crypto.randomBytes(32);
        
        // Комбинируем machine ID и случайные байты для создания уникального ключа
        const hash = crypto.createHash('sha256');
        hash.update(machineId);
        hash.update(randomBytes);
        key = hash.digest('hex');
        
        // Сохраняем ключ для последующего использования
        store.set('encryptionKey', key);
    }
    
    return Buffer.from(key, 'hex');
}

/**
 * Шифрует строку
 * @param {string} text - Текст для шифрования
 * @returns {string} - Зашифрованный текст в формате: iv:authTag:encryptedData (все в hex)
 */
function encrypt(text) {
    if (!text) return text;
    
    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        // Возвращаем: IV:AuthTag:EncryptedData
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('[ENCRYPTION] Error encrypting data:', error);
        return text; // В случае ошибки возвращаем оригинальный текст
    }
}

/**
 * Дешифрует строку
 * @param {string} encryptedText - Зашифрованный текст в формате: iv:authTag:encryptedData
 * @returns {string} - Расшифрованный текст
 */
function decrypt(encryptedText) {
    if (!encryptedText) return encryptedText;
    
    try {
        // Проверяем, является ли текст зашифрованным (содержит два двоеточия)
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            // Это незашифрованный текст (старые данные)
            return encryptedText;
        }
        
        const [ivHex, authTagHex, encrypted] = parts;
        
        const key = getEncryptionKey();
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('[ENCRYPTION] Error decrypting data:', error);
        // Если не получилось расшифровать, возможно это старые незашифрованные данные
        return encryptedText;
    }
}

/**
 * Проверяет, является ли строка зашифрованной
 * @param {string} text - Текст для проверки
 * @returns {boolean}
 */
function isEncrypted(text) {
    if (!text || typeof text !== 'string') return false;
    const parts = text.split(':');
    return parts.length === 3 && parts[0].length === IV_LENGTH * 2 && parts[1].length === AUTH_TAG_LENGTH * 2;
}

module.exports = {
    encrypt,
    decrypt,
    isEncrypted
};

