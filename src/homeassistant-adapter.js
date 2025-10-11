/**
 * Home Assistant Smart Plug Adapter
 * Адаптер для работы с Home Assistant REST API
 * Документация: https://developers.home-assistant.io/docs/api/rest/
 */

const axios = require('axios');

class HomeAssistantAdapter {
  constructor(config) {
    this.baseUrl = config.baseUrl; // http://homeassistant.local:8123
    this.token = config.token;
    this.debug = config.debug || false;
    
    // Настройка axios instance
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    this.log('Home Assistant Adapter initialized', 'info');
  }
  
  /**
   * Логирование
   * @param {string} message - Сообщение
   * @param {string} level - Уровень (info, debug, error, warn)
   */
  log(message, level = 'info') {
    if (!this.debug && level === 'debug') return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[HomeAssistant ${timestamp}] [${level.toUpperCase()}]`;
    
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
   * Проверка подключения к Home Assistant API
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      this.log('Testing connection to Home Assistant API...', 'debug');
      
      const response = await this.api.get('/api/');
      
      if (response.status === 200 && response.data && response.data.message === 'API running.') {
        this.log('✅ Connection test successful', 'info');
        return true;
      } else {
        this.log('❌ Connection test failed: Unexpected response', 'error');
        return false;
      }
    } catch (error) {
      this.log(`Connection test error: ${error.message}`, 'error');
      return false;
    }
  }
  
  /**
   * Получить все entity
   * @returns {Promise<Array>}
   */
  async getEntities() {
    try {
      this.log('Fetching all entities...', 'debug');
      
      const response = await this.api.get('/api/states');
      
      if (response.status === 200) {
        this.log(`✅ Fetched ${response.data.length} entities`, 'debug');
        return response.data;
      } else {
        this.log('❌ Failed to fetch entities', 'error');
        return [];
      }
    } catch (error) {
      this.log(`Error fetching entities: ${error.message}`, 'error');
      return [];
    }
  }
  
  /**
   * Получить все розетки (switches)
   * @returns {Promise<Array>}
   */
  async getSwitches() {
    try {
      this.log('Fetching all switches...', 'debug');
      
      const entities = await this.getEntities();
      
      // Фильтруем только switch entities
      const switches = entities.filter(entity => 
        entity.entity_id.startsWith('switch.') ||
        (entity.attributes && entity.attributes.device_class === 'outlet')
      );
      
      this.log(`✅ Found ${switches.length} switches`, 'debug');
      
      return switches.map(entity => ({
        id: entity.entity_id,
        name: entity.attributes.friendly_name || entity.entity_id,
        state: entity.state,
        attributes: entity.attributes
      }));
    } catch (error) {
      this.log(`Error fetching switches: ${error.message}`, 'error');
      return [];
    }
  }
  
  /**
   * Получить статус entity
   * @param {string} entityId - ID entity (например, switch.printer_plug)
   * @returns {Promise<Object>}
   */
  async getState(entityId) {
    try {
      this.log(`Getting state for entity: ${entityId}`, 'debug');
      
      const response = await this.api.get(`/api/states/${entityId}`);
      
      if (response.status === 200) {
        this.log(`✅ State retrieved for ${entityId}: ${response.data.state}`, 'debug');
        return {
          success: true,
          state: response.data.state,
          attributes: response.data.attributes
        };
      } else {
        this.log(`❌ Failed to get state for ${entityId}`, 'error');
        return {
          success: false,
          error: 'Failed to get state'
        };
      }
    } catch (error) {
      this.log(`Error getting state: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Вызвать service Home Assistant
   * @param {string} domain - Домен (например, 'switch')
   * @param {string} service - Сервис (например, 'turn_on')
   * @param {string} entityId - ID entity
   * @returns {Promise<Object>}
   */
  async callService(domain, service, entityId) {
    try {
      this.log(`Calling service: ${domain}.${service} for ${entityId}`, 'debug');
      
      const response = await this.api.post(
        `/api/services/${domain}/${service}`,
        { entity_id: entityId }
      );
      
      if (response.status === 200) {
        this.log(`✅ Service ${domain}.${service} called successfully`, 'info');
        return {
          success: true,
          result: response.data
        };
      } else {
        this.log(`❌ Failed to call service ${domain}.${service}`, 'error');
        return {
          success: false,
          error: 'Failed to call service'
        };
      }
    } catch (error) {
      this.log(`Error calling service: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Включить розетку
   * @param {string} entityId - ID entity
   * @returns {Promise<Object>}
   */
  async turnOn(entityId) {
    try {
      this.log(`🔌 Turning ON entity: ${entityId}`, 'info');
      
      const result = await this.callService('switch', 'turn_on', entityId);
      
      if (result.success) {
        this.log(`✅ Entity ${entityId} turned ON successfully`, 'info');
      } else {
        this.log(`❌ Failed to turn ON ${entityId}`, 'error');
      }
      
      return result;
    } catch (error) {
      this.log(`Failed to turn on ${entityId}: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Выключить розетку
   * @param {string} entityId - ID entity
   * @returns {Promise<Object>}
   */
  async turnOff(entityId) {
    try {
      this.log(`🔌 Turning OFF entity: ${entityId}`, 'info');
      
      const result = await this.callService('switch', 'turn_off', entityId);
      
      if (result.success) {
        this.log(`✅ Entity ${entityId} turned OFF successfully`, 'info');
      } else {
        this.log(`❌ Failed to turn OFF ${entityId}`, 'error');
      }
      
      return result;
    } catch (error) {
      this.log(`Failed to turn off ${entityId}: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Проверить, включено ли устройство
   * @param {string} entityId - ID entity
   * @returns {Promise<boolean|null>}
   */
  async isDeviceOn(entityId) {
    try {
      const stateResponse = await this.getState(entityId);
      
      if (!stateResponse.success) {
        return null;
      }
      
      return stateResponse.state === 'on';
    } catch (error) {
      this.log(`Error checking device status: ${error.message}`, 'error');
      return null;
    }
  }
  
  /**
   * Получить статистику энергопотребления (если поддерживается)
   * @param {string} entityId - ID entity
   * @returns {Promise<Object>}
   */
  async getEnergyStats(entityId) {
    try {
      this.log(`📊 Getting energy stats for: ${entityId}`, 'debug');
      
      const stateResponse = await this.getState(entityId);
      
      if (!stateResponse.success) {
        return {
          success: false,
          error: stateResponse.error
        };
      }
      
      const attributes = stateResponse.attributes || {};
      
      // Извлекаем данные если они есть
      const stats = {
        power: attributes.current_power_w || 0,
        voltage: attributes.voltage || 0,
        current: attributes.current_a || 0,
        energy: attributes.total_energy_kwh || 0,
        timestamp: Date.now()
      };
      
      this.log(`📊 Energy stats: ${stats.power}W, ${stats.voltage}V, ${stats.current}A`, 'debug');
      
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
   * Получить информацию о Home Assistant
   * @returns {Promise<Object>}
   */
  async getInfo() {
    try {
      this.log('Getting Home Assistant info...', 'debug');
      
      const response = await this.api.get('/api/config');
      
      if (response.status === 200) {
        this.log('✅ Home Assistant info retrieved', 'debug');
        return {
          success: true,
          info: {
            version: response.data.version,
            location: response.data.location_name,
            timezone: response.data.time_zone
          }
        };
      } else {
        return {
          success: false,
          error: 'Failed to get info'
        };
      }
    } catch (error) {
      this.log(`Error getting info: ${error.message}`, 'error');
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = HomeAssistantAdapter;

