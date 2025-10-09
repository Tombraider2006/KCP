/**
 * Network Scanner для обнаружения 3D принтеров в локальной сети
 * Поддерживает Klipper (Moonraker) и Bambu Lab принтеры
 */

import http from 'http';
import https from 'https';
import os from 'os';

/**
 * Получает список IP адресов для сканирования на основе локальной сети
 */
function getLocalNetworkIPs() {
    const networks = os.networkInterfaces();
    const localIPs = [];
    
    for (const name of Object.keys(networks)) {
        for (const net of networks[name]) {
            // Пропускаем не-IPv4 и внутренние адреса
            if (net.family === 'IPv4' && !net.internal) {
                localIPs.push({
                    ip: net.address,
                    cidr: net.cidr,
                    netmask: net.netmask
                });
            }
        }
    }
    
    return localIPs;
}

/**
 * Генерирует список IP адресов для сканирования из подсети
 */
function generateIPRange(baseIP, netmask) {
    const ips = [];
    const parts = baseIP.split('.').map(Number);
    const maskParts = netmask.split('.').map(Number);
    
    // Простое сканирование для /24 сети (255.255.255.0)
    if (maskParts[0] === 255 && maskParts[1] === 255 && maskParts[2] === 255) {
        const baseNetwork = `${parts[0]}.${parts[1]}.${parts[2]}`;
        for (let i = 1; i < 255; i++) {
            ips.push(`${baseNetwork}.${i}`);
        }
    }
    // Для /16 сети (255.255.0.0) - сканируем только последние 2 октета, ограниченно
    else if (maskParts[0] === 255 && maskParts[1] === 255) {
        const baseNetwork = `${parts[0]}.${parts[1]}`;
        // Сканируем только текущую подсеть + соседние
        for (let j = Math.max(0, parts[2] - 2); j <= Math.min(255, parts[2] + 2); j++) {
            for (let i = 1; i < 255; i++) {
                ips.push(`${baseNetwork}.${j}.${i}`);
            }
        }
    }
    
    return ips;
}

/**
 * Проверяет доступность Klipper (Moonraker) на указанном IP
 */
function checkKlipper(ip, port = 7125, timeout = 2000) {
    return new Promise((resolve) => {
        const options = {
            hostname: ip,
            port: port,
            path: '/printer/info',
            method: 'GET',
            timeout: timeout
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.result) {
                        // Пробуем определить имя принтера
                        const hostname = result.result.hostname || '';
                        resolve({
                            found: true,
                            type: 'klipper',
                            ip: ip,
                            port: port,
                            name: hostname || `Klipper (${ip})`,
                            info: result.result
                        });
                    } else {
                        resolve({ found: false });
                    }
                } catch (e) {
                    resolve({ found: false });
                }
            });
        });
        
        req.on('error', () => {
            resolve({ found: false });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({ found: false });
        });
        
        req.end();
    });
}

/**
 * Проверяет доступность веб-интерфейса принтера
 * Разные веб-интерфейсы Klipper используют разные порты:
 * - Mainsail/Fluidd (MainsailOS/FluiddPi): 80 (nginx)
 * - OctoPrint: 5000
 * - Кастомные установки: 4408, 4409, 4400, 4401 (популярные у пользователей)
 * - Альтернативные порты: 81, 8080, 8081, 443 (HTTPS)
 */
function checkWebInterface(ip, timeout = 1500) {
    return new Promise((resolve) => {
        // Порты в порядке приоритета (наиболее часто используемые)
        const ports = [
            80,    // Mainsail/Fluidd (стандартный HTTP)
            4408,  // Кастомный порт (популярный у пользователей)
            4409,  // Кастомный порт (популярный у пользователей)
            4400,  // Кастомный порт (популярный у пользователей)
            4401,  // Кастомный порт (популярный у пользователей)
            5000,  // OctoPrint
            8080,  // Альтернативный HTTP
            81,    // Альтернативный nginx
            443,   // HTTPS
            8081,  // Альтернативный
            7125   // Moonraker API (fallback)
        ];
        
        let checked = 0;
        let foundPort = null;
        let foundPorts = [];
        
        ports.forEach(port => {
            const options = {
                hostname: ip,
                port: port,
                path: '/',
                method: 'HEAD',
                timeout: timeout
            };
            
            // Для HTTPS используем https модуль
            const protocol = port === 443 ? https : http;
            
            const req = protocol.request(options, (res) => {
                if (res.statusCode && res.statusCode < 400) {
                    if (!foundPort) {
                        foundPort = port;
                    }
                    foundPorts.push(port);
                }
                checked++;
                if (checked === ports.length) {
                    // Возвращаем первый найденный порт или 80 по умолчанию
                    resolve(foundPort || 80);
                }
            });
            
            req.on('error', () => {
                checked++;
                if (checked === ports.length) {
                    resolve(foundPort || 80);
                }
            });
            
            req.on('timeout', () => {
                req.destroy();
                checked++;
                if (checked === ports.length) {
                    resolve(foundPort || 80);
                }
            });
            
            req.end();
        });
        
        // Таймаут на весь процесс проверки
        setTimeout(() => {
            if (checked < ports.length) {
                resolve(foundPort || 80);
            }
        }, timeout * ports.length);
    });
}

/**
 * Проверяет доступность Bambu Lab принтера через MQTT порт
 * Примечание: полная проверка MQTT требует подключения с учетными данными,
 * поэтому мы просто проверяем открыт ли порт 8883
 */
function checkBambuLab(ip, timeout = 2000) {
    return new Promise((resolve) => {
        const net = require('net');
        const socket = new net.Socket();
        
        socket.setTimeout(timeout);
        
        socket.on('connect', () => {
            socket.destroy();
            // Порт открыт, возможно это Bambu Lab принтер
            resolve({
                found: true,
                type: 'bambu',
                ip: ip,
                port: 8883,
                name: `Bambu Lab (${ip})`,
                info: { note: 'MQTT port is open, requires access code and serial number' }
            });
        });
        
        socket.on('error', () => {
            resolve({ found: false });
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve({ found: false });
        });
        
        socket.connect(8883, ip);
    });
}

/**
 * Сканирует один IP адрес на наличие принтеров
 */
async function scanIP(ip, progressCallback) {
    if (progressCallback) {
        progressCallback(ip);
    }
    
    // Сначала проверяем Klipper (более быстрая проверка через HTTP)
    const klipperResult = await checkKlipper(ip);
    if (klipperResult.found) {
        // Проверяем веб-интерфейс
        const webPort = await checkWebInterface(ip);
        klipperResult.webPort = webPort;
        return klipperResult;
    }
    
    // Если не Klipper, проверяем Bambu Lab
    const bambuResult = await checkBambuLab(ip);
    if (bambuResult.found) {
        return bambuResult;
    }
    
    return null;
}

/**
 * Сканирует локальную сеть на наличие принтеров
 * @param {Function} progressCallback - Callback для обновления прогресса (ip, current, total)
 * @param {Function} foundCallback - Callback при нахождении принтера
 */
async function scanNetwork(progressCallback, foundCallback) {
    const localNetworks = getLocalNetworkIPs();
    
    if (localNetworks.length === 0) {
        throw new Error('No local network interfaces found');
    }
    
    const allIPs = new Set();
    
    // Генерируем список IP для сканирования
    for (const network of localNetworks) {
        const ips = generateIPRange(network.ip, network.netmask);
        ips.forEach(ip => allIPs.add(ip));
    }
    
    const ipList = Array.from(allIPs);
    const total = ipList.length;
    let current = 0;
    const foundPrinters = [];
    
    // Сканируем параллельно, но с ограничением
    const concurrentLimit = 50; // Количество одновременных проверок
    
    for (let i = 0; i < ipList.length; i += concurrentLimit) {
        const batch = ipList.slice(i, i + concurrentLimit);
        const promises = batch.map(ip => 
            scanIP(ip, (scanningIP) => {
                current++;
                if (progressCallback) {
                    progressCallback(scanningIP, current, total);
                }
            })
        );
        
        const results = await Promise.all(promises);
        
        results.forEach(result => {
            if (result) {
                foundPrinters.push(result);
                if (foundCallback) {
                    foundCallback(result);
                }
            }
        });
    }
    
    return foundPrinters;
}

/**
 * Быстрое сканирование - проверяет только типичные IP адреса
 */
async function quickScan(progressCallback, foundCallback) {
    const localNetworks = getLocalNetworkIPs();
    
    if (localNetworks.length === 0) {
        throw new Error('No local network interfaces found');
    }
    
    // Для быстрого сканирования проверяем только часто используемые адреса
    const commonLastOctets = [
        // Роутеры и типичные адреса
        1, 254,
        // Часто назначаемые DHCP адреса
        ...Array.from({length: 50}, (_, i) => i + 100), // 100-149
        // Статические адреса
        ...Array.from({length: 50}, (_, i) => i + 10)   // 10-59
    ];
    
    const ipsToScan = new Set();
    
    for (const network of localNetworks) {
        const parts = network.ip.split('.');
        const baseNetwork = `${parts[0]}.${parts[1]}.${parts[2]}`;
        
        commonLastOctets.forEach(lastOctet => {
            ipsToScan.add(`${baseNetwork}.${lastOctet}`);
        });
    }
    
    const ipList = Array.from(ipsToScan);
    const total = ipList.length;
    let current = 0;
    const foundPrinters = [];
    
    const concurrentLimit = 20;
    
    for (let i = 0; i < ipList.length; i += concurrentLimit) {
        const batch = ipList.slice(i, i + concurrentLimit);
        const promises = batch.map(ip => 
            scanIP(ip, (scanningIP) => {
                current++;
                if (progressCallback) {
                    progressCallback(scanningIP, current, total);
                }
            })
        );
        
        const results = await Promise.all(promises);
        
        results.forEach(result => {
            if (result) {
                foundPrinters.push(result);
                if (foundCallback) {
                    foundCallback(result);
                }
            }
        });
    }
    
    return foundPrinters;
}

export {
    scanNetwork,
    quickScan,
    getLocalNetworkIPs
};

