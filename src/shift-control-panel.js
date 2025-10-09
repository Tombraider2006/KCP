// ============================================================================
// SHIFT CONTROL PANEL - UI для управления сменами и пользователями
// ============================================================================

import UserManager from './user-manager.js';
import ShiftManager from './shift-manager.js';
import ReportsManager from './reports-manager.js';

class ShiftControlPanel {
  constructor() {
    this.userManager = new UserManager();
    this.shiftManager = new ShiftManager();
    this.reportsManager = new ReportsManager(this.shiftManager, this.userManager);
    
    this.currentUser = null;
    this.currentShift = null;
    
    this.init();
  }

  async init() {
    this.currentUser = await window.electronAPI.storeGet('currentUser', null);
    
    if (!this.currentUser) {
      window.location.href = 'login.html';
      return;
    }

    this.shiftManager.loadCurrentShift();
    this.currentShift = this.shiftManager.getCurrentShift();

    this.createShiftInfoBar();
    this.createUserManagementModal();
    this.createShiftTransferModal();
    this.createReportsModal();
    
    this.updateShiftInfo();
    
    setInterval(() => this.updateShiftInfo(), 60000);
  }

  // ========== ИНФОРМАЦИОННАЯ ПАНЕЛЬ СМЕНЫ ==========

  createShiftInfoBar() {
    const existingBar = document.getElementById('shiftInfoBar');
    if (existingBar) existingBar.remove();

    const bar = document.createElement('div');
    bar.id = 'shiftInfoBar';
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    bar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 20px;">
        <div id="shiftUserInfo" style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px;">👤</span>
          <div>
            <div style="font-weight: 600; font-size: 14px;" id="shiftUsername">Загрузка...</div>
            <div style="font-size: 11px; opacity: 0.9;" id="shiftDuration">--</div>
          </div>
        </div>
        ${this.currentUser.role === 'admin' ? `
          <button id="btnManageUsers" style="
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 6px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
          ">
            👥 Управление пользователями
          </button>
        ` : ''}
        <button id="btnViewReports" style="
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 6px 15px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        ">
          📊 Отчеты
        </button>
      </div>
      <div style="display: flex; gap: 10px; align-items: center;">
        <button id="btnTransferShift" style="
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.3s ease;
        ">
          🔄 Передать смену
        </button>
        <button id="btnEndShift" style="
          background: rgba(220, 53, 69, 0.9);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.3s ease;
        ">
          🚪 Выйти
        </button>
      </div>
    `;

    // Добавляем отступ для основного содержимого
    const body = document.body;
    body.style.paddingTop = '60px';

    // Вставляем в начало body
    body.insertBefore(bar, body.firstChild);

    // Привязываем события
    this.attachBarEvents();
  }

  attachBarEvents() {
    const btnManageUsers = document.getElementById('btnManageUsers');
    const btnViewReports = document.getElementById('btnViewReports');
    const btnTransferShift = document.getElementById('btnTransferShift');
    const btnEndShift = document.getElementById('btnEndShift');

    if (btnManageUsers) {
      btnManageUsers.addEventListener('click', () => this.showUserManagementModal());
      btnManageUsers.addEventListener('mouseenter', (e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.3)';
      });
      btnManageUsers.addEventListener('mouseleave', (e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
      });
    }

    if (btnViewReports) {
      btnViewReports.addEventListener('click', () => this.showReportsModal());
      btnViewReports.addEventListener('mouseenter', (e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.3)';
      });
      btnViewReports.addEventListener('mouseleave', (e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
      });
    }

    btnTransferShift.addEventListener('click', () => this.showShiftTransferModal());
    btnTransferShift.addEventListener('mouseenter', (e) => {
      e.target.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    btnTransferShift.addEventListener('mouseleave', (e) => {
      e.target.style.background = 'rgba(255, 255, 255, 0.2)';
    });

    btnEndShift.addEventListener('click', () => this.endShift());
    btnEndShift.addEventListener('mouseenter', (e) => {
      e.target.style.background = 'rgba(220, 53, 69, 1)';
    });
    btnEndShift.addEventListener('mouseleave', (e) => {
      e.target.style.background = 'rgba(220, 53, 69, 0.9)';
    });
  }

  updateShiftInfo() {
    this.currentShift = this.shiftManager.getCurrentShift();
    
    const usernameEl = document.getElementById('shiftUsername');
    const durationEl = document.getElementById('shiftDuration');

    if (this.currentShift && usernameEl && durationEl) {
      let roleEmoji = this.currentShift.role === 'admin' ? '👑' : '👤';
      let roleName = this.currentShift.role === 'admin' ? 'Администратор' : 'Оператор';
      
      if (this.currentUser && this.currentUser.isSuperAdmin) {
        roleEmoji = '⚡';
        roleName = 'SUPERADMIN';
      }
      
      usernameEl.textContent = `${roleEmoji} ${this.currentShift.displayName} (${roleName})`;
      durationEl.textContent = `Смена: ${this.formatDuration(this.currentShift.duration)}`;
    }
  }

  // ========== МОДАЛЬНОЕ ОКНО УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ ==========

  createUserManagementModal() {
    const modal = document.createElement('div');
    modal.id = 'userManagementModal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 20000;
      overflow-y: auto;
      padding: 20px;
    `;

    modal.innerHTML = `
      <div style="
        max-width: 800px;
        margin: 40px auto;
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 30px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0;">👥 Управление пользователями</h2>
          <button id="closeUserManagementModal" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 5px;
          ">✕</button>
        </div>

        <div style="margin-bottom: 20px;">
          <button id="btnAddOperator" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          ">
            ➕ Добавить оператора
          </button>
        </div>

        <div id="operatorsList" style="margin-top: 20px;"></div>

        <!-- Форма добавления оператора -->
        <div id="addOperatorForm" style="display: none; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <h3 style="color: #333; margin-bottom: 15px;">Новый оператор</h3>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; color: #555; font-weight: 600;">Логин</label>
            <input type="text" id="newOperatorUsername" placeholder="Логин (минимум 3 символа)" style="
              width: 100%;
              padding: 10px;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              font-size: 14px;
            ">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; color: #555; font-weight: 600;">Отображаемое имя</label>
            <input type="text" id="newOperatorDisplayName" placeholder="Имя для отображения" style="
              width: 100%;
              padding: 10px;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              font-size: 14px;
            ">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; color: #555; font-weight: 600;">Пароль</label>
            <input type="password" id="newOperatorPassword" placeholder="Пароль (минимум 4 символа)" style="
              width: 100%;
              padding: 10px;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              font-size: 14px;
            ">
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="btnSaveOperator" style="
              background: #28a745;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
            ">✅ Сохранить</button>
            <button id="btnCancelAddOperator" style="
              background: #6c757d;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
            ">❌ Отмена</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // События
    document.getElementById('closeUserManagementModal').addEventListener('click', () => this.closeModal('userManagementModal'));
    document.getElementById('btnAddOperator').addEventListener('click', () => this.showAddOperatorForm());
    document.getElementById('btnCancelAddOperator').addEventListener('click', () => this.hideAddOperatorForm());
    document.getElementById('btnSaveOperator').addEventListener('click', () => this.saveOperator());
  }

  showUserManagementModal() {
    this.refreshOperatorsList();
    document.getElementById('userManagementModal').style.display = 'block';
  }

  refreshOperatorsList() {
    const listEl = document.getElementById('operatorsList');
    const operators = this.userManager.getAllOperators();

    if (operators.length === 0) {
      listEl.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Нет операторов</p>';
      return;
    }

    listEl.innerHTML = operators.map(op => `
      <div style="
        background: white;
        border: 2px solid ${op.isActive ? '#e0e0e0' : '#ffcdd2'};
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <div style="font-weight: 600; color: #333; font-size: 16px;">
            ${op.displayName} 
            <span style="color: #999; font-size: 14px;">(${op.username})</span>
            ${!op.isActive ? '<span style="color: #dc3545; font-size: 12px;">❌ Неактивен</span>' : ''}
          </div>
          <div style="color: #666; font-size: 12px; margin-top: 5px;">
            Создан: ${new Date(op.createdAt).toLocaleString('ru-RU')}
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="shiftControlPanel.resetPassword('${op.id}')" style="
            background: #ffc107;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
          ">🔑 Сбросить пароль</button>
          <button onclick="shiftControlPanel.toggleOperatorStatus('${op.id}')" style="
            background: ${op.isActive ? '#6c757d' : '#28a745'};
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
          ">${op.isActive ? '🚫 Деактивировать' : '✅ Активировать'}</button>
          <button onclick="shiftControlPanel.removeOperator('${op.id}')" style="
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
          ">🗑️ Удалить</button>
        </div>
      </div>
    `).join('');
  }

  showAddOperatorForm() {
    document.getElementById('addOperatorForm').style.display = 'block';
    document.getElementById('newOperatorUsername').focus();
  }

  hideAddOperatorForm() {
    document.getElementById('addOperatorForm').style.display = 'none';
    document.getElementById('newOperatorUsername').value = '';
    document.getElementById('newOperatorDisplayName').value = '';
    document.getElementById('newOperatorPassword').value = '';
  }

  async saveOperator() {
    const username = document.getElementById('newOperatorUsername').value.trim();
    const displayName = document.getElementById('newOperatorDisplayName').value.trim() || username;
    const password = document.getElementById('newOperatorPassword').value;

    try {
      const result = this.userManager.addOperator(this.currentUser.id, username, password, displayName);
      if (result.success) {
        alert('✅ Оператор успешно добавлен!');
        this.hideAddOperatorForm();
        this.refreshOperatorsList();
      }
    } catch (error) {
      alert('❌ Ошибка: ' + error.message);
    }
  }

  resetPassword(operatorId) {
    const newPassword = prompt('Введите новый пароль (минимум 4 символа):');
    if (!newPassword) return;

    try {
      this.userManager.resetOperatorPassword(this.currentUser.id, operatorId, newPassword);
      alert(`✅ Пароль успешно изменен!\n\nНовый пароль: ${newPassword}\n\nОбязательно сообщите его оператору!`);
    } catch (error) {
      alert('❌ Ошибка: ' + error.message);
    }
  }

  toggleOperatorStatus(operatorId) {
    try {
      const result = this.userManager.toggleOperatorStatus(this.currentUser.id, operatorId);
      if (result.success) {
        this.refreshOperatorsList();
      }
    } catch (error) {
      alert('❌ Ошибка: ' + error.message);
    }
  }

  removeOperator(operatorId) {
    const operator = this.userManager.getUserById(operatorId);
    if (!confirm(`Удалить оператора ${operator.displayName}?`)) return;

    try {
      this.userManager.removeOperator(this.currentUser.id, operatorId);
      alert('✅ Оператор удален');
      this.refreshOperatorsList();
    } catch (error) {
      alert('❌ Ошибка: ' + error.message);
    }
  }

  // ========== МОДАЛЬНОЕ ОКНО ПЕРЕДАЧИ СМЕНЫ ==========

  createShiftTransferModal() {
    const modal = document.createElement('div');
    modal.id = 'shiftTransferModal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 20000;
      padding: 20px;
    `;

    modal.innerHTML = `
      <div style="
        max-width: 500px;
        margin: 100px auto;
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 30px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0;">🔄 Передача смены</h2>
          <button id="closeShiftTransferModal" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 5px;
          ">✕</button>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 600;">Выберите нового оператора</label>
          <select id="transferToUser" style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
          ">
            <option value="">-- Выберите пользователя --</option>
          </select>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; color: #555; font-weight: 600;">Пароль нового оператора</label>
          <input type="password" id="transferPassword" placeholder="Введите пароль" style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
          ">
        </div>

        <button id="btnConfirmTransfer" style="
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        ">✅ Передать смену</button>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('closeShiftTransferModal').addEventListener('click', () => this.closeModal('shiftTransferModal'));
    document.getElementById('btnConfirmTransfer').addEventListener('click', () => this.confirmTransfer());
  }

  showShiftTransferModal() {
    // Заполняем список пользователей
    const select = document.getElementById('transferToUser');
    select.innerHTML = '<option value="">-- Выберите пользователя --</option>';

    const users = [...this.userManager.getAdministrators(), ...this.userManager.getActiveOperators()];
    users.forEach(user => {
      if (user.id !== this.currentUser.id) {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.displayName} (${user.username}) - ${user.role === 'admin' ? '👑 Администратор' : '👤 Оператор'}`;
        option.dataset.username = user.username;
        option.dataset.displayName = user.displayName;
        option.dataset.role = user.role;
        select.appendChild(option);
      }
    });

    document.getElementById('shiftTransferModal').style.display = 'block';
  }

  async confirmTransfer() {
    const select = document.getElementById('transferToUser');
    const password = document.getElementById('transferPassword').value;

    if (!select.value) {
      alert('Выберите пользователя');
      return;
    }

    if (!password) {
      alert('Введите пароль');
      return;
    }

    const selectedOption = select.options[select.selectedIndex];
    const newUserId = select.value;
    const newUsername = selectedOption.dataset.username;
    const newDisplayName = selectedOption.dataset.displayName;
    const newRole = selectedOption.dataset.role;

    // Проверяем пароль
    try {
      const authResult = this.userManager.authenticate(newUsername, password);
      if (!authResult.success) {
        alert('❌ Неверный пароль');
        return;
      }

      // Передаем смену
      const result = this.shiftManager.transferShift(
        this.currentUser.id,
        newUserId,
        newUsername,
        newDisplayName,
        newRole
      );

      if (result.success) {
        // Обновляем текущего пользователя
        this.currentUser = authResult.user;
        await window.electronAPI.storeSet('currentUser', this.currentUser);

        alert('✅ Смена успешно передана!');
        this.closeModal('shiftTransferModal');
        this.updateShiftInfo();

        // Очищаем поля
        select.value = '';
        document.getElementById('transferPassword').value = '';
      }
    } catch (error) {
      alert('❌ Ошибка: ' + error.message);
    }
  }

  // ========== МОДАЛЬНОЕ ОКНО ОТЧЕТОВ ==========

  createReportsModal() {
    const modal = document.createElement('div');
    modal.id = 'reportsModal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 20000;
      overflow-y: auto;
      padding: 20px;
    `;

    modal.innerHTML = `
      <div style="
        max-width: 900px;
        margin: 40px auto;
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 30px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
          <h2 style="color: #333; margin: 0;">📊 Отчеты и статистика</h2>
          <button id="closeReportsModal" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 5px;
          ">✕</button>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <select id="reportPeriod" style="
            padding: 10px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
          ">
            <option value="day">За день</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
          </select>
          
          ${this.currentUser.role === 'admin' ? `
            <select id="reportUser" style="
              flex: 1;
              padding: 10px;
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              font-size: 14px;
            ">
              <option value="">Все операторы</option>
            </select>
          ` : ''}

          <button id="btnGenerateReport" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
          ">📈 Сформировать отчет</button>
        </div>

        <div id="reportContent" style="margin-top: 20px;"></div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('closeReportsModal').addEventListener('click', () => this.closeModal('reportsModal'));
    document.getElementById('btnGenerateReport').addEventListener('click', () => this.generateReport());
  }

  showReportsModal() {
    // Заполняем список пользователей для админа
    if (this.currentUser.role === 'admin') {
      const select = document.getElementById('reportUser');
      select.innerHTML = '<option value="">Все операторы</option>';
      
      const operators = this.userManager.getAllOperators();
      operators.forEach(op => {
        const option = document.createElement('option');
        option.value = op.id;
        option.textContent = op.displayName;
        select.appendChild(option);
      });
    }

    document.getElementById('reportsModal').style.display = 'block';
  }

  generateReport() {
    const period = document.getElementById('reportPeriod').value;
    const userIdSelect = document.getElementById('reportUser');
    const userId = userIdSelect ? userIdSelect.value : this.currentUser.id;

    try {
      let report;
      
      if (userId) {
        // Отчет по одному оператору
        report = this.reportsManager.generateShortReport(userId, period);
        this.displayReport(report);
      } else {
        // Сравнительный отчет (только для админа)
        const operatorIds = this.userManager.getAllOperators().map(op => op.id);
        report = this.reportsManager.generateComparativeReport(operatorIds, period);
        this.displayComparativeReport(report);
      }
    } catch (error) {
      alert('❌ Ошибка при генерации отчета: ' + error.message);
    }
  }

  displayReport(report) {
    const content = document.getElementById('reportContent');
    content.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0;">Оператор: ${report.user.displayName}</h3>
        <p style="margin: 0; opacity: 0.9;">Период: ${report.periodName}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: ${this.getScoreColor(report.kpi.overallScore)};">${report.kpi.overallScore}</div>
          <div style="color: #666; font-size: 14px;">Общий балл</div>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: ${this.getScoreColor(report.kpi.productivity)};">${report.kpi.productivity}</div>
          <div style="color: #666; font-size: 14px;">Производительность</div>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: ${this.getScoreColor(report.kpi.quality)};">${report.kpi.quality}</div>
          <div style="color: #666; font-size: 14px;">Качество</div>
        </div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: ${this.getScoreColor(report.kpi.efficiency)};">${report.kpi.efficiency}</div>
          <div style="color: #666; font-size: 14px;">Эффективность</div>
        </div>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 15px 0; color: #333;">Сводка</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div><strong>Всего смен:</strong> ${report.summary.totalShifts}</div>
          <div><strong>Общее время:</strong> ${report.summary.totalWorkTime}</div>
          <div><strong>Средняя смена:</strong> ${report.summary.averageShiftDuration}</div>
          <div><strong>Выполнение:</strong> ${report.summary.completionRate}%</div>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; background: ${this.getPerformanceBgColor(report.kpi.overallScore)}; border-radius: 10px;">
        <div style="font-size: 48px;">${report.summary.performance.emoji}</div>
        <div style="font-size: 24px; font-weight: bold; color: #333; margin-top: 10px;">${report.summary.performance.level}</div>
      </div>
    `;
  }

  displayComparativeReport(report) {
    const content = document.getElementById('reportContent');
    content.innerHTML = `
      <h3 style="margin-bottom: 15px;">Сравнительный отчет - ${report.periodName}</h3>
      
      <div style="margin-bottom: 20px;">
        ${report.ranking.map((item, index) => `
          <div style="
            background: ${index === 0 ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#f8f9fa'};
            color: ${index === 0 ? 'white' : '#333'};
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div>
              <div style="font-size: 18px; font-weight: bold;">
                ${index === 0 ? '🏆' : `${index + 1}.`} ${item.displayName}
              </div>
              <div style="font-size: 14px; opacity: ${index === 0 ? '0.9' : '0.7'};">
                Эффективность: ${item.efficiencyScore}%
              </div>
            </div>
            <div style="font-size: 24px; font-weight: bold;">
              ${item.overallScore}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="background: #e7f3ff; padding: 15px; border-radius: 10px;">
        <strong>Средние показатели:</strong>
        <div style="margin-top: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center;">
          <div>
            <div style="font-size: 20px; font-weight: bold; color: #667eea;">${report.averages.overallScore}</div>
            <div style="font-size: 12px; color: #666;">Общий</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: bold; color: #667eea;">${report.averages.productivity}</div>
            <div style="font-size: 12px; color: #666;">Продукт.</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: bold; color: #667eea;">${report.averages.quality}</div>
            <div style="font-size: 12px; color: #666;">Качество</div>
          </div>
          <div>
            <div style="font-size: 20px; font-weight: bold; color: #667eea;">${report.averages.efficiency}</div>
            <div style="font-size: 12px; color: #666;">Эффект.</div>
          </div>
        </div>
      </div>
    `;
  }

  // ========== ЗАВЕРШЕНИЕ СМЕНЫ ==========

  async endShift() {
    if (!confirm('Вы действительно хотите завершить смену и выйти?')) return;

    try {
      this.shiftManager.endShift(this.currentUser.id);
      await window.electronAPI.storeSet('currentUser', null);
      await window.electronAPI.storeSet('isAuthenticated', false);
      
      window.location.href = 'login.html';
    } catch (error) {
      alert('❌ Ошибка при завершении смены: ' + error.message);
    }
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
  }

  formatDuration(ms) {
    if (!ms || ms === 0) return '0м';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}ч ${minutes % 60}м`;
    } else if (minutes > 0) {
      return `${minutes}м`;
    } else {
      return `${seconds}с`;
    }
  }

  getScoreColor(score) {
    if (score >= 90) return '#28a745';
    if (score >= 75) return '#17a2b8';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  }

  getPerformanceBgColor(score) {
    if (score >= 90) return '#d4edda';
    if (score >= 75) return '#d1ecf1';
    if (score >= 60) return '#fff3cd';
    return '#f8d7da';
  }
}

// Создаем глобальный экземпляр
let shiftControlPanel;

// Инициализируем при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
  shiftControlPanel = new ShiftControlPanel();
});

export default ShiftControlPanel;

