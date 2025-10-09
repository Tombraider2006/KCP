// ============================================================================
// SHIFT MANAGER - Система управления сменами
// ============================================================================

const Store = require('electron-store');

class ShiftManager {
  constructor() {
    this.store = new Store({
      name: 'shifts-data',
      encryptionKey: 'y0ur-s3cr3t-k3y-f0r-sh1ft-d4t4'
    });
    
    this.currentShift = null;
  }

  // ========== УПРАВЛЕНИЕ СМЕНАМИ ==========

  /**
   * Начинает новую смену
   */
  startShift(userId, username, displayName, role) {
    // Проверяем, нет ли активной смены
    if (this.currentShift) {
      throw new Error('Another shift is already active. Please end it first.');
    }

    const shift = {
      id: this.generateShiftId(),
      userId,
      username,
      displayName,
      role,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      events: [],
      statistics: {
        printsStarted: 0,
        printsCompleted: 0,
        printsFailed: 0,
        printsPaused: 0,
        gaps: 0,
        pauses: 0,
        totalGapTime: 0,
        totalPauseTime: 0,
        efficiencyScore: 100
      },
      notes: []
    };

    this.currentShift = shift;
    this.saveCurrentShift();
    this.logShiftAction(shift.id, 'shift_started', { userId, username });

    return { success: true, shift };
  }

  /**
   * Завершает текущую смену
   */
  endShift(userId) {
    if (!this.currentShift) {
      throw new Error('No active shift to end');
    }

    if (this.currentShift.userId !== userId) {
      throw new Error('Only the current shift operator can end the shift');
    }

    const now = new Date();
    this.currentShift.endTime = now.toISOString();
    this.currentShift.duration = now - new Date(this.currentShift.startTime);

    // Сохраняем смену в историю
    this.saveShiftToHistory(this.currentShift);
    this.logShiftAction(this.currentShift.id, 'shift_ended', { 
      userId, 
      duration: this.currentShift.duration 
    });

    const completedShift = { ...this.currentShift };
    this.currentShift = null;
    this.saveCurrentShift();

    return { success: true, shift: completedShift };
  }

  /**
   * Передает смену другому пользователю
   */
  transferShift(currentUserId, newUserId, newUsername, newDisplayName, newRole) {
    if (!this.currentShift) {
      throw new Error('No active shift to transfer');
    }

    if (this.currentShift.userId !== currentUserId) {
      throw new Error('Only the current shift operator can transfer the shift');
    }

    // Завершаем текущую смену
    const oldShift = this.endShift(currentUserId);

    // Начинаем новую смену
    const newShift = this.startShift(newUserId, newUsername, newDisplayName, newRole);

    this.logShiftAction(newShift.shift.id, 'shift_transferred', {
      fromUserId: currentUserId,
      toUserId: newUserId,
      fromUsername: oldShift.shift.username,
      toUsername: newUsername
    });

    return { 
      success: true, 
      oldShift: oldShift.shift, 
      newShift: newShift.shift 
    };
  }

  /**
   * Получает текущую смену
   */
  getCurrentShift() {
    if (!this.currentShift) {
      return null;
    }

    // Обновляем длительность
    const now = new Date();
    this.currentShift.duration = now - new Date(this.currentShift.startTime);

    return { ...this.currentShift };
  }

  /**
   * Проверяет, есть ли активная смена
   */
  hasActiveShift() {
    return this.currentShift !== null;
  }

  // ========== СОБЫТИЯ СМЕНЫ ==========

  /**
   * Добавляет событие в текущую смену
   */
  addShiftEvent(eventType, eventData) {
    if (!this.currentShift) {
      return { success: false, error: 'No active shift' };
    }

    const event = {
      id: this.generateEventId(),
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString()
    };

    this.currentShift.events.push(event);

    // Обновляем статистику в зависимости от типа события
    this.updateShiftStatistics(eventType, eventData);

    this.saveCurrentShift();

    return { success: true, event };
  }

  /**
   * Обновляет статистику смены на основе события
   */
  updateShiftStatistics(eventType, eventData) {
    if (!this.currentShift) return;

    const stats = this.currentShift.statistics;

    switch (eventType) {
      case 'print_started':
        stats.printsStarted++;
        break;
      case 'print_completed':
        stats.printsCompleted++;
        break;
      case 'print_failed':
        stats.printsFailed++;
        break;
      case 'print_paused':
        stats.printsPaused++;
        break;
      case 'gap_detected':
        stats.gaps++;
        if (eventData.duration) {
          stats.totalGapTime += eventData.duration;
        }
        break;
      case 'pause_detected':
        stats.pauses++;
        if (eventData.duration) {
          stats.totalPauseTime += eventData.duration;
        }
        break;
    }

    // Пересчитываем эффективность
    this.recalculateEfficiency();
  }

  /**
   * Пересчитывает показатель эффективности смены
   */
  recalculateEfficiency() {
    if (!this.currentShift) return;

    const stats = this.currentShift.statistics;
    let efficiency = 100;

    // Снижаем за неудачные печати
    if (stats.printsStarted > 0) {
      const failureRate = stats.printsFailed / stats.printsStarted;
      efficiency -= failureRate * 20; // до -20%
    }

    // Снижаем за паузы
    const pausePenalty = Math.min(stats.pauses * 2, 15); // до -15%
    efficiency -= pausePenalty;

    // Снижаем за перерывы
    const gapPenalty = Math.min(stats.gaps * 3, 20); // до -20%
    efficiency -= gapPenalty;

    // Снижаем за время простоя
    const totalShiftTime = new Date() - new Date(this.currentShift.startTime);
    if (totalShiftTime > 0) {
      const idleTimeRatio = (stats.totalGapTime + stats.totalPauseTime) / totalShiftTime;
      const idlePenalty = Math.min(idleTimeRatio * 30, 25); // до -25%
      efficiency -= idlePenalty;
    }

    stats.efficiencyScore = Math.max(0, Math.round(efficiency));
  }

  /**
   * Добавляет заметку к смене
   */
  addShiftNote(note, addedBy) {
    if (!this.currentShift) {
      throw new Error('No active shift');
    }

    const noteObj = {
      id: this.generateEventId(),
      text: note,
      addedBy,
      timestamp: new Date().toISOString()
    };

    this.currentShift.notes.push(noteObj);
    this.saveCurrentShift();

    return { success: true, note: noteObj };
  }

  // ========== ИСТОРИЯ СМЕН ==========

  /**
   * Сохраняет смену в историю
   */
  saveShiftToHistory(shift) {
    const history = this.store.get('shift_history', []);
    history.push(shift);

    // Храним последние 1000 смен
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }

    this.store.set('shift_history', history);
  }

  /**
   * Получает историю смен
   */
  getShiftHistory(options = {}) {
    const {
      userId = null,
      startDate = null,
      endDate = null,
      limit = 100
    } = options;

    let history = this.store.get('shift_history', []);

    // Фильтруем по пользователю
    if (userId) {
      history = history.filter(s => s.userId === userId);
    }

    // Фильтруем по датам
    if (startDate) {
      const start = new Date(startDate);
      history = history.filter(s => new Date(s.startTime) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      history = history.filter(s => new Date(s.startTime) <= end);
    }

    // Сортируем по дате (новые первыми)
    history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    // Ограничиваем количество
    return history.slice(0, limit);
  }

  /**
   * Получает статистику по сменам пользователя
   */
  getUserShiftStatistics(userId, period = 'all') {
    let shifts = this.getShiftHistory({ userId, limit: 1000 });

    // Фильтруем по периоду
    const now = new Date();
    if (period === 'day') {
      const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
      shifts = shifts.filter(s => new Date(s.startTime) >= dayAgo);
    } else if (period === 'week') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      shifts = shifts.filter(s => new Date(s.startTime) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      shifts = shifts.filter(s => new Date(s.startTime) >= monthAgo);
    }

    // Вычисляем агрегированную статистику
    const stats = {
      totalShifts: shifts.length,
      totalDuration: 0,
      averageDuration: 0,
      totalPrintsStarted: 0,
      totalPrintsCompleted: 0,
      totalPrintsFailed: 0,
      totalPrintsPaused: 0,
      totalGaps: 0,
      totalPauses: 0,
      totalGapTime: 0,
      totalPauseTime: 0,
      averageEfficiency: 0
    };

    if (shifts.length === 0) {
      return stats;
    }

    let totalEfficiency = 0;

    shifts.forEach(shift => {
      stats.totalDuration += shift.duration;
      stats.totalPrintsStarted += shift.statistics.printsStarted;
      stats.totalPrintsCompleted += shift.statistics.printsCompleted;
      stats.totalPrintsFailed += shift.statistics.printsFailed;
      stats.totalPrintsPaused += shift.statistics.printsPaused;
      stats.totalGaps += shift.statistics.gaps;
      stats.totalPauses += shift.statistics.pauses;
      stats.totalGapTime += shift.statistics.totalGapTime;
      stats.totalPauseTime += shift.statistics.totalPauseTime;
      totalEfficiency += shift.statistics.efficiencyScore;
    });

    stats.averageDuration = stats.totalDuration / shifts.length;
    stats.averageEfficiency = Math.round(totalEfficiency / shifts.length);

    return stats;
  }

  /**
   * Получает смену по ID
   */
  getShiftById(shiftId) {
    const history = this.store.get('shift_history', []);
    return history.find(s => s.id === shiftId);
  }

  // ========== ПЕРСИСТЕНТНОСТЬ ==========

  /**
   * Сохраняет текущую смену
   */
  saveCurrentShift() {
    if (this.currentShift) {
      this.store.set('current_shift', this.currentShift);
    } else {
      this.store.delete('current_shift');
    }
  }

  /**
   * Загружает текущую смену (при запуске приложения)
   */
  loadCurrentShift() {
    const saved = this.store.get('current_shift', null);
    if (saved) {
      this.currentShift = saved;
      return { success: true, shift: saved };
    }
    return { success: false, shift: null };
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

  /**
   * Генерирует уникальный ID смены
   */
  generateShiftId() {
    return 'shift_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Генерирует уникальный ID события
   */
  generateEventId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Логирует действия со сменами
   */
  logShiftAction(shiftId, action, details = {}) {
    const logs = this.store.get('shift_logs', []);
    logs.push({
      shiftId,
      action,
      details,
      timestamp: new Date().toISOString()
    });

    // Храним только последние 500 записей
    if (logs.length > 500) {
      logs.splice(0, logs.length - 500);
    }

    this.store.set('shift_logs', logs);
  }

  /**
   * Форматирует длительность в читаемый вид
   */
  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}ч ${minutes % 60}м`;
    } else if (minutes > 0) {
      return `${minutes}м ${seconds % 60}с`;
    } else {
      return `${seconds}с`;
    }
  }

  /**
   * Экспортирует историю смен
   */
  exportShiftHistory() {
    return this.store.get('shift_history', []);
  }

  /**
   * Очищает все данные (используется только для тестирования!)
   */
  clearAllData() {
    this.currentShift = null;
    this.store.clear();
    return { success: true };
  }
}

module.exports = ShiftManager;

