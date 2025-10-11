/**
 * Tuya Smart Plug Adapter
 * Адаптер для работы с Tuya Cloud API
 * Документация: https://developer.tuya.com/en/docs/iot
 */

const { TuyaContext } = require('@tuya/tuya-connector-nodejs');

class TuyaAdapter {
  constructor(config) {
    this.baseUrl = config.baseUrl || 'https://openapi.tuyaeu.com';
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.debug = config.debug || false;
    
    // Инициализация Tuya Context
    this.context = new TuyaContext({
      baseUrl: this.baseUrl,
      accessKey: this.accessKey,
      secretKey: this.secretKey
    });
    
    this.log('Tuya Adapter initialized', 'info');
  }
  
  /**
   * Логирование
   * @param {string} message - Сообщение
   * @param {string} level - Уровень (info, debug, error, warn)
   */
  log(message, level = 'info') {
    if (!this.debug && level === 'debug') return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[TuyaAdapter ${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'error':
        console.error(`${prefix} ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }
  
  /**
   * Проверка подключения к Tuya Cloud API
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      this.log('Testing connection to Tuya Cloud API...', 'debug');
      
      const response = await this.context.request({
        method: 'GET',
        path: '/v1.0/token?grant_type=1'
      });
      
      if (response.success) {
        this.log('✅ Connection test successful', 'info');
        return true;
      } else {
        this.log(`❌ Connection test failed: ${response.msg}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Connection test error: ${error.message}`, 'error');
      return false;
    }
  }
  
  /**
   * Получить список всех устройств
   * @returns {Promise<Array>}
   */
  async getDevices() {
    try {
      this.log('Fetching all devices...', 'debug');
      
      const response = await this.context.request({
        method: 'GET',
        path: '/v1.0/devices'
      });
      
      if (response.success) {
        this.log(`✅ Fetched ${response.result.list?.length || 0} devices`, 'debug');
        return response.result.list || [];
      } else {
        this.log(`❌ Failed to fetch devices: ${response.msg}`, 'error');
        return [];
      }
    } catch (error) {
      this.log(`Error fetching devices: ${error.message}`, 'error');
      return [];
    }
  }
  
  /**
   * Получить статус конкретного устройства
   * @param {string} deviceId - ID устройства
   * @returns {Promise<Object>}
   */
  async getDeviceStatus(deviceId) {
    try {
      this.log(`Getting status for device: ${deviceId}`, 'debug');
      
      const response = await this.context.request({
        method: 'GET',
        path: `/v1.0/devices/${deviceId}/status`
      });
      
      if (response.success) {
        this.log(`✅ Status retrieved for ${deviceId}`, 'debug');
        return {
          success: true,
          status: response.result || []
        };
      } else {
        this.log(`❌ Failed to get status for ${deviceId}: ${response.msg}`, 'error');
        return {
          success: false,
          error: response.msg
        };
      }
    } catch (error) {
      this.log(`Error getting device status: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Отправить команду устройству
   * @param {string} deviceId - ID устройства
   * @param {string} code - Код команды (например, 'switch_1')
   * @param {any} value - Значение команды
   * @returns {Promise<Object>}
   */
  async sendCommand(deviceId, code, value) {
    try {
      this.log(`Sending command to ${deviceId}: ${code} = ${value}`, 'debug');
      
      const response = await this.context.request({
        method: 'POST',
        path: `/v1.0/devices/${deviceId}/commands`,
        body: {
          commands: [{
            code: code,
            value: value
          }]
        }
      });
      
      if (response.success) {
        this.log(`✅ Command sent successfully to ${deviceId}`, 'info');
        return {
          success: true,
          result: response.result
        };
      } else {
        this.log(`❌ Failed to send command to ${deviceId}: ${response.msg}`, 'error');
        return {
          success: false,
          error: response.msg
        };
      }
    } catch (error) {
      this.log(`Error sending command: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Включить розетку
   * @param {string} deviceId - ID устройства
   * @returns {Promise<Object>}
   */
  async turnOn(deviceId) {
    try {
      this.log(`🔌 Turning ON device: ${deviceId}`, 'info');
      
      const result = await this.sendCommand(deviceId, 'switch_1', true);
      
      if (result.success) {
        this.log(`✅ Device ${deviceId} turned ON successfully`, 'info');
      } else {
        this.log(`❌ Failed to turn ON ${deviceId}`, 'error');
      }
      
      return result;
    } catch (error) {
      this.log(`Failed to turn on ${deviceId}: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Выключить розетку
   * @param {string} deviceId - ID устройства
   * @returns {Promise<Object>}
   */
  async turnOff(deviceId) {
    try {
      this.log(`🔌 Turning OFF device: ${deviceId}`, 'info');
      
      const result = await this.sendCommand(deviceId, 'switch_1', false);
      
      if (result.success) {
        this.log(`✅ Device ${deviceId} turned OFF successfully`, 'info');
      } else {
        this.log(`❌ Failed to turn OFF ${deviceId}`, 'error');
      }
      
      return result;
    } catch (error) {
      this.log(`Failed to turn off ${deviceId}: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Получить статистику энергопотребления
   * @param {string} deviceId - ID устройства
   * @returns {Promise<Object>}
   */
  async getEnergyStats(deviceId) {
    try {
      this.log(`📊 Getting energy stats for: ${deviceId}`, 'debug');
      
      const statusResponse = await this.getDeviceStatus(deviceId);
      
      if (!statusResponse.success) {
        return {
          success: false,
          error: statusResponse.error
        };
      }
      
      const status = statusResponse.status;
      
      // Извлекаем данные о мощности, напряжении, токе
      const powerData = status.find(s => s.code === 'cur_power');
      const voltageData = status.find(s => s.code === 'cur_voltage');
      const currentData = status.find(s => s.code === 'cur_current');
      
      const stats = {
        power: powerData ? powerData.value / 10 : 0,       // Вт
        voltage: voltageData ? voltageData.value / 10 : 0, // В
        current: currentData ? currentData.value : 0,       // мА
        timestamp: Date.now()
      };
      
      this.log(`📊 Energy stats: ${stats.power}W, ${stats.voltage}V, ${stats.current}mA`, 'debug');
      
      return {
        success: true,
        stats: stats
      };
    } catch (error) {
      this.log(`Error getting energy stats: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Получить полную информацию об устройстве
   * @param {string} deviceId - ID устройства
   * @returns {Promise<Object>}
   */
  async getDeviceInfo(deviceId) {
    try {
      this.log(`Getting device info for: ${deviceId}`, 'debug');
      
      const response = await this.context.request({
        method: 'GET',
        path: `/v1.0/devices/${deviceId}`
      });
      
      if (response.success) {
        this.log(`✅ Device info retrieved for ${deviceId}`, 'debug');
        return {
          success: true,
          device: response.result
        };
      } else {
        this.log(`❌ Failed to get device info: ${response.msg}`, 'error');
        return {
          success: false,
          error: response.msg
        };
      }
    } catch (error) {
      this.log(`Error getting device info: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Проверить, включено ли устройство
   * @param {string} deviceId - ID устройства
   * @returns {Promise<boolean|null>}
   */
  async isDeviceOn(deviceId) {
    try {
      const statusResponse = await this.getDeviceStatus(deviceId);
      
      if (!statusResponse.success) {
        return null;
      }
      
      const switchStatus = statusResponse.status.find(s => s.code === 'switch_1');
      return switchStatus ? switchStatus.value === true : null;
    } catch (error) {
      this.log(`Error checking device status: ${error.message}`, 'error');
      return null;
    }
  }
}

module.exports = TuyaAdapter;

