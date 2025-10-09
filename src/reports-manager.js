// ============================================================================
// REPORTS MANAGER - Система отчетности и KPI
// ============================================================================

const Store = require('electron-store');

class ReportsManager {
  constructor(shiftManager, userManager) {
    this.shiftManager = shiftManager;
    this.userManager = userManager;
    this.store = new Store({
      name: 'reports-data',
      encryptionKey: 'y0ur-s3cr3t-k3y-f0r-r3p0rts-d4t4'
    });
  }

  // ========== ГЕНЕРАЦИЯ ОТЧЕТОВ ==========

  /**
   * Генерирует краткий отчет (KPI)
   */
  generateShortReport(userId, period = 'day') {
    const user = this.userManager.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const stats = this.shiftManager.getUserShiftStatistics(userId, period);
    const shifts = this.shiftManager.getShiftHistory({ 
      userId, 
      limit: 1000 
    }).filter(s => this.isInPeriod(s.startTime, period));

    const kpi = this.calculateKPI(stats, shifts);

    return {
      period,
      periodName: this.getPeriodName(period),
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      },
      dateRange: this.getDateRange(period),
      generatedAt: new Date().toISOString(),
      kpi,
      summary: {
        totalShifts: stats.totalShifts,
        totalWorkTime: this.formatDuration(stats.totalDuration),
        averageShiftDuration: this.formatDuration(stats.averageDuration),
        efficiencyScore: stats.averageEfficiency,
        completionRate: this.calculateCompletionRate(stats),
        performance: this.getPerformanceLevel(kpi.overallScore)
      }
    };
  }

  /**
   * Генерирует подробный отчет
   */
  generateDetailedReport(userId, period = 'day') {
    const shortReport = this.generateShortReport(userId, period);
    const user = this.userManager.getUserById(userId);
    
    const shifts = this.shiftManager.getShiftHistory({ 
      userId, 
      limit: 1000 
    }).filter(s => this.isInPeriod(s.startTime, period));

    // Анализ неэффективности
    const inefficiencyAnalysis = this.analyzeInefficiency(shifts);

    // Детализация по сменам
    const shiftDetails = shifts.map(shift => ({
      id: shift.id,
      startTime: shift.startTime,
      endTime: shift.endTime,
      duration: this.formatDuration(shift.duration),
      statistics: shift.statistics,
      events: shift.events,
      notes: shift.notes,
      inefficiencies: this.getShiftInefficiencies(shift)
    }));

    // Рекомендации
    const recommendations = this.generateRecommendations(
      shortReport.kpi, 
      inefficiencyAnalysis
    );

    return {
      ...shortReport,
      inefficiencyAnalysis,
      shiftDetails,
      recommendations,
      charts: this.prepareChartData(shifts, period)
    };
  }

  /**
   * Генерирует сравнительный отчет (несколько операторов)
   */
  generateComparativeReport(userIds, period = 'day') {
    const reports = userIds.map(userId => {
      try {
        return this.generateShortReport(userId, period);
      } catch (error) {
        return null;
      }
    }).filter(r => r !== null);

    // Сортируем по общему баллу
    reports.sort((a, b) => b.kpi.overallScore - a.kpi.overallScore);

    // Вычисляем средние значения
    const averages = this.calculateAverages(reports);

    return {
      period,
      periodName: this.getPeriodName(period),
      dateRange: this.getDateRange(period),
      generatedAt: new Date().toISOString(),
      reports,
      averages,
      ranking: reports.map((r, index) => ({
        rank: index + 1,
        userId: r.user.id,
        displayName: r.user.displayName,
        overallScore: r.kpi.overallScore,
        efficiencyScore: r.summary.efficiencyScore
      }))
    };
  }

  // ========== РАСЧЕТ KPI ==========

  /**
   * Вычисляет KPI оператора
   */
  calculateKPI(stats, shifts) {
    const kpi = {
      productivity: 0,        // Производительность
      quality: 0,             // Качество
      efficiency: 0,          // Эффективность
      reliability: 0,         // Надежность
      overallScore: 0         // Общий балл
    };

    // 1. Производительность (0-100)
    // Базируется на количестве завершенных печатей за смену
    if (stats.totalShifts > 0 && stats.totalDuration > 0) {
      const avgPrintsPerHour = (stats.totalPrintsCompleted / (stats.totalDuration / (1000 * 60 * 60)));
      kpi.productivity = Math.min(100, avgPrintsPerHour * 20); // 5 печатей/час = 100 баллов
    }

    // 2. Качество (0-100)
    // Базируется на проценте успешных печатей
    if (stats.totalPrintsStarted > 0) {
      const successRate = stats.totalPrintsCompleted / stats.totalPrintsStarted;
      kpi.quality = Math.round(successRate * 100);
    } else {
      kpi.quality = 100; // Если печатей не было, качество 100
    }

    // 3. Эффективность (0-100)
    // Берем из средней эффективности смен
    kpi.efficiency = stats.averageEfficiency;

    // 4. Надежность (0-100)
    // Базируется на отсутствии простоев и пауз
    if (stats.totalDuration > 0) {
      const idleRatio = (stats.totalGapTime + stats.totalPauseTime) / stats.totalDuration;
      kpi.reliability = Math.max(0, Math.round(100 - (idleRatio * 100)));
    } else {
      kpi.reliability = 100;
    }

    // 5. Общий балл (среднее взвешенное)
    kpi.overallScore = Math.round(
      (kpi.productivity * 0.3) +
      (kpi.quality * 0.3) +
      (kpi.efficiency * 0.25) +
      (kpi.reliability * 0.15)
    );

    return kpi;
  }

  /**
   * Вычисляет процент выполнения
   */
  calculateCompletionRate(stats) {
    if (stats.totalPrintsStarted === 0) {
      return 100;
    }
    return Math.round((stats.totalPrintsCompleted / stats.totalPrintsStarted) * 100);
  }

  /**
   * Определяет уровень производительности
   */
  getPerformanceLevel(score) {
    if (score >= 90) return { level: 'Отличный', emoji: '🌟' };
    if (score >= 75) return { level: 'Хороший', emoji: '✅' };
    if (score >= 60) return { level: 'Удовлетворительный', emoji: '👍' };
    if (score >= 40) return { level: 'Ниже среднего', emoji: '⚠️' };
    return { level: 'Требует улучшения', emoji: '❌' };
  }

  // ========== АНАЛИЗ НЕЭФФЕКТИВНОСТИ ==========

  /**
   * Анализирует причины неэффективности
   */
  analyzeInefficiency(shifts) {
    const analysis = {
      totalInefficiencies: 0,
      categories: {
        gaps: { count: 0, totalTime: 0, percentage: 0 },
        pauses: { count: 0, totalTime: 0, percentage: 0 },
        failures: { count: 0, percentage: 0 }
      },
      topIssues: [],
      detailedEvents: []
    };

    let totalIssueTime = 0;

    shifts.forEach(shift => {
      // Собираем данные о gaps
      analysis.categories.gaps.count += shift.statistics.gaps;
      analysis.categories.gaps.totalTime += shift.statistics.totalGapTime;
      totalIssueTime += shift.statistics.totalGapTime;

      // Собираем данные о паузах
      analysis.categories.pauses.count += shift.statistics.pauses;
      analysis.categories.pauses.totalTime += shift.statistics.totalPauseTime;
      totalIssueTime += shift.statistics.totalPauseTime;

      // Собираем данные о неудачах
      analysis.categories.failures.count += shift.statistics.printsFailed;

      // Собираем детальные события
      shift.events.forEach(event => {
        if (['gap_detected', 'pause_detected', 'print_failed'].includes(event.type)) {
          analysis.detailedEvents.push({
            shiftId: shift.id,
            timestamp: event.timestamp,
            type: event.type,
            data: event.data,
            operator: shift.displayName
          });
        }
      });

      // Добавляем заметки оператора как объяснения
      shift.notes.forEach(note => {
        analysis.detailedEvents.push({
          shiftId: shift.id,
          timestamp: note.timestamp,
          type: 'operator_note',
          data: { text: note.text },
          operator: shift.displayName
        });
      });
    });

    // Вычисляем проценты
    if (totalIssueTime > 0) {
      analysis.categories.gaps.percentage = 
        Math.round((analysis.categories.gaps.totalTime / totalIssueTime) * 100);
      analysis.categories.pauses.percentage = 
        Math.round((analysis.categories.pauses.totalTime / totalIssueTime) * 100);
    }

    const totalPrints = shifts.reduce((sum, s) => sum + s.statistics.printsStarted, 0);
    if (totalPrints > 0) {
      analysis.categories.failures.percentage = 
        Math.round((analysis.categories.failures.count / totalPrints) * 100);
    }

    analysis.totalInefficiencies = 
      analysis.categories.gaps.count + 
      analysis.categories.pauses.count + 
      analysis.categories.failures.count;

    // Определяем топ проблем
    const issues = [
      { 
        type: 'Перерывы между печатями', 
        count: analysis.categories.gaps.count,
        time: analysis.categories.gaps.totalTime,
        severity: this.calculateSeverity(analysis.categories.gaps.count, analysis.categories.gaps.totalTime)
      },
      { 
        type: 'Паузы во время печати', 
        count: analysis.categories.pauses.count,
        time: analysis.categories.pauses.totalTime,
        severity: this.calculateSeverity(analysis.categories.pauses.count, analysis.categories.pauses.totalTime)
      },
      { 
        type: 'Неудачные печати', 
        count: analysis.categories.failures.count,
        time: 0,
        severity: this.calculateSeverity(analysis.categories.failures.count, 0)
      }
    ];

    analysis.topIssues = issues
      .filter(i => i.count > 0)
      .sort((a, b) => b.severity - a.severity);

    // Сортируем детальные события по времени
    analysis.detailedEvents.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return analysis;
  }

  /**
   * Получает неэффективности конкретной смены
   */
  getShiftInefficiencies(shift) {
    const inefficiencies = [];

    // Gaps
    if (shift.statistics.gaps > 0) {
      inefficiencies.push({
        type: 'gap',
        count: shift.statistics.gaps,
        totalTime: shift.statistics.totalGapTime,
        description: `Перерывы между печатями: ${shift.statistics.gaps} раз(а), всего ${this.formatDuration(shift.statistics.totalGapTime)}`
      });
    }

    // Pauses
    if (shift.statistics.pauses > 0) {
      inefficiencies.push({
        type: 'pause',
        count: shift.statistics.pauses,
        totalTime: shift.statistics.totalPauseTime,
        description: `Паузы во время печати: ${shift.statistics.pauses} раз(а), всего ${this.formatDuration(shift.statistics.totalPauseTime)}`
      });
    }

    // Failures
    if (shift.statistics.printsFailed > 0) {
      inefficiencies.push({
        type: 'failure',
        count: shift.statistics.printsFailed,
        description: `Неудачные печати: ${shift.statistics.printsFailed} раз(а)`
      });
    }

    return inefficiencies;
  }

  /**
   * Вычисляет серьезность проблемы
   */
  calculateSeverity(count, time) {
    let severity = count * 10;
    if (time > 0) {
      severity += (time / (1000 * 60)) * 2; // +2 за каждую минуту
    }
    return severity;
  }

  // ========== РЕКОМЕНДАЦИИ ==========

  /**
   * Генерирует рекомендации для улучшения
   */
  generateRecommendations(kpi, inefficiencyAnalysis) {
    const recommendations = [];

    // Рекомендации по производительности
    if (kpi.productivity < 70) {
      recommendations.push({
        category: 'Производительность',
        priority: 'high',
        issue: 'Низкая скорость выполнения печатей',
        suggestion: 'Оптимизируйте процесс подготовки принтера к следующей печати. Подготавливайте файлы заранее.'
      });
    }

    // Рекомендации по качеству
    if (kpi.quality < 80) {
      recommendations.push({
        category: 'Качество',
        priority: 'high',
        issue: 'Высокий процент неудачных печатей',
        suggestion: 'Проверьте настройки слайсера, качество материала и калибровку принтеров.'
      });
    }

    // Рекомендации по эффективности
    if (kpi.efficiency < 75) {
      recommendations.push({
        category: 'Эффективность',
        priority: 'medium',
        issue: 'Недостаточная эффективность работы',
        suggestion: 'Сократите время простоя между печатями. Планируйте задачи заранее.'
      });
    }

    // Рекомендации по надежности
    if (kpi.reliability < 80) {
      recommendations.push({
        category: 'Надежность',
        priority: 'medium',
        issue: 'Частые паузы и перерывы',
        suggestion: 'Избегайте ненужных пауз во время печати. Контролируйте процесс внимательнее.'
      });
    }

    // Рекомендации по gaps
    if (inefficiencyAnalysis.categories.gaps.count > 5) {
      recommendations.push({
        category: 'Перерывы',
        priority: 'medium',
        issue: 'Много перерывов между печатями',
        suggestion: 'Подготавливайте следующие файлы для печати заранее. Минимизируйте время между заданиями.'
      });
    }

    // Рекомендации по паузам
    if (inefficiencyAnalysis.categories.pauses.count > 3) {
      recommendations.push({
        category: 'Паузы',
        priority: 'high',
        issue: 'Частые паузы во время печати',
        suggestion: 'Избегайте приостановки печати без необходимости. Проверьте причины пауз.'
      });
    }

    // Если все хорошо
    if (recommendations.length === 0) {
      recommendations.push({
        category: 'Общее',
        priority: 'info',
        issue: 'Отличная работа!',
        suggestion: 'Продолжайте в том же духе. Все показатели в норме.'
      });
    }

    return recommendations;
  }

  // ========== ДАННЫЕ ДЛЯ ГРАФИКОВ ==========

  /**
   * Подготавливает данные для графиков
   */
  prepareChartData(shifts, period) {
    // График эффективности по времени
    const efficiencyChart = {
      labels: [],
      data: []
    };

    // График производительности
    const productivityChart = {
      labels: [],
      data: []
    };

    // График распределения времени
    const timeDistribution = {
      labels: ['Активная работа', 'Перерывы', 'Паузы'],
      data: [0, 0, 0]
    };

    shifts.forEach(shift => {
      const date = new Date(shift.startTime).toLocaleDateString('ru-RU');
      efficiencyChart.labels.push(date);
      efficiencyChart.data.push(shift.statistics.efficiencyScore);

      productivityChart.labels.push(date);
      productivityChart.data.push(shift.statistics.printsCompleted);

      const activeTime = shift.duration - shift.statistics.totalGapTime - shift.statistics.totalPauseTime;
      timeDistribution.data[0] += activeTime;
      timeDistribution.data[1] += shift.statistics.totalGapTime;
      timeDistribution.data[2] += shift.statistics.totalPauseTime;
    });

    return {
      efficiency: efficiencyChart,
      productivity: productivityChart,
      timeDistribution
    };
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

  /**
   * Проверяет, попадает ли дата в период
   */
  isInPeriod(dateString, period) {
    const date = new Date(dateString);
    const now = new Date();

    switch (period) {
      case 'day':
        return now - date < 24 * 60 * 60 * 1000;
      case 'week':
        return now - date < 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return now - date < 30 * 24 * 60 * 60 * 1000;
      case 'all':
        return true;
      default:
        return false;
    }
  }

  /**
   * Получает название периода
   */
  getPeriodName(period) {
    const names = {
      'day': 'За день',
      'week': 'За неделю',
      'month': 'За месяц',
      'all': 'За всё время'
    };
    return names[period] || period;
  }

  /**
   * Получает диапазон дат для периода
   */
  getDateRange(period) {
    const now = new Date();
    let start;

    switch (period) {
      case 'day':
        start = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        start = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(0);
    }

    return {
      start: start.toISOString(),
      end: now.toISOString()
    };
  }

  /**
   * Форматирует длительность
   */
  formatDuration(milliseconds) {
    if (!milliseconds || milliseconds === 0) return '0м';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}д ${hours % 24}ч`;
    } else if (hours > 0) {
      return `${hours}ч ${minutes % 60}м`;
    } else if (minutes > 0) {
      return `${minutes}м`;
    } else {
      return `${seconds}с`;
    }
  }

  /**
   * Вычисляет средние значения для сравнительного отчета
   */
  calculateAverages(reports) {
    if (reports.length === 0) {
      return {
        overallScore: 0,
        productivity: 0,
        quality: 0,
        efficiency: 0,
        reliability: 0
      };
    }

    const sum = reports.reduce((acc, r) => ({
      overallScore: acc.overallScore + r.kpi.overallScore,
      productivity: acc.productivity + r.kpi.productivity,
      quality: acc.quality + r.kpi.quality,
      efficiency: acc.efficiency + r.kpi.efficiency,
      reliability: acc.reliability + r.kpi.reliability
    }), { overallScore: 0, productivity: 0, quality: 0, efficiency: 0, reliability: 0 });

    return {
      overallScore: Math.round(sum.overallScore / reports.length),
      productivity: Math.round(sum.productivity / reports.length),
      quality: Math.round(sum.quality / reports.length),
      efficiency: Math.round(sum.efficiency / reports.length),
      reliability: Math.round(sum.reliability / reports.length)
    };
  }

  /**
   * Экспортирует отчет в текстовый формат
   */
  exportReportToText(report) {
    let text = `=== ОТЧЕТ ${report.periodName.toUpperCase()} ===\n\n`;
    text += `Оператор: ${report.user.displayName} (${report.user.username})\n`;
    text += `Период: ${new Date(report.dateRange.start).toLocaleString('ru-RU')} - ${new Date(report.dateRange.end).toLocaleString('ru-RU')}\n`;
    text += `Сгенерирован: ${new Date(report.generatedAt).toLocaleString('ru-RU')}\n\n`;

    text += `--- KPI ---\n`;
    text += `Общий балл: ${report.kpi.overallScore}/100 ${report.summary.performance.emoji}\n`;
    text += `Производительность: ${report.kpi.productivity}/100\n`;
    text += `Качество: ${report.kpi.quality}/100\n`;
    text += `Эффективность: ${report.kpi.efficiency}/100\n`;
    text += `Надежность: ${report.kpi.reliability}/100\n\n`;

    text += `--- Сводка ---\n`;
    text += `Всего смен: ${report.summary.totalShifts}\n`;
    text += `Общее время работы: ${report.summary.totalWorkTime}\n`;
    text += `Средняя длительность смены: ${report.summary.averageShiftDuration}\n`;
    text += `Процент выполнения: ${report.summary.completionRate}%\n`;
    text += `Оценка: ${report.summary.performance.level}\n\n`;

    return text;
  }

  /**
   * Сохраняет отчет в хранилище
   */
  saveReport(report, type = 'detailed') {
    const savedReports = this.store.get('saved_reports', []);
    
    const savedReport = {
      id: 'report_' + Date.now(),
      type,
      userId: report.user.id,
      period: report.period,
      generatedAt: report.generatedAt,
      data: report
    };

    savedReports.push(savedReport);

    // Храним только последние 100 отчетов
    if (savedReports.length > 100) {
      savedReports.splice(0, savedReports.length - 100);
    }

    this.store.set('saved_reports', savedReports);
    return savedReport;
  }

  /**
   * Получает сохраненные отчеты
   */
  getSavedReports(userId = null, limit = 20) {
    let reports = this.store.get('saved_reports', []);

    if (userId) {
      reports = reports.filter(r => r.userId === userId);
    }

    reports.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));

    return reports.slice(0, limit);
  }
}

module.exports = ReportsManager;

