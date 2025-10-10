/**
 * Встроенный Web-сервер для удаленного доступа к панели управления принтерами
 * Предоставляет REST API и WebSocket для real-time обновлений
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
const { StructuredPrinterManager } = require('./data-structures');

class WebServer {
  constructor(store, bambuConnections, structuredManager = null) {
    this.store = store;
    this.bambuConnections = bambuConnections;
    this.structuredManager = structuredManager || new StructuredPrinterManager(store, bambuConnections);
    this.app = express();
    this.server = null;
    this.io = null;
    this.isRunning = false;
    this.port = 8000;
    this.clients = new Set();
  }

  /**
   * Инициализация и запуск сервера
   */
  async start(port = 8000) {
    if (this.isRunning) {
      console.log('[WebServer] Already running');
      return;
    }

    this.port = port;

    // Middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'web-interface')));

    // Создаем HTTP сервер
    this.server = http.createServer(this.app);

    // Инициализируем Socket.IO
    this.io = socketIO(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Настраиваем роуты
    this.setupRoutes();
    this.setupWebSocket();

    // Запускаем сервер
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        this.isRunning = true;
        console.log(`[WebServer] 🌐 Web-сервер запущен на http://localhost:${this.port}`);
        resolve({ success: true, port: this.port });
      }).on('error', (error) => {
        console.error('[WebServer] Ошибка запуска:', error.message);
        this.isRunning = false;
        reject(error);
      });
    });
  }

  /**
   * Остановка сервера
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    return new Promise((resolve) => {
      // Отключаем всех клиентов
      if (this.io) {
        this.io.disconnectSockets(true);
        this.io.close();
      }

      this.clients.clear();

      if (this.server) {
        // Таймаут на случай зависания
        const timeout = setTimeout(() => {
          console.log('[WebServer] ⚠️ Принудительная остановка по таймауту');
          this.isRunning = false;
          resolve();
        }, 3000);

        this.server.close(() => {
          clearTimeout(timeout);
          this.isRunning = false;
          console.log('[WebServer] 🛑 Web-сервер остановлен');
          resolve();
        });

        // Принудительно закрываем все соединения
        this.server.closeAllConnections?.();
      } else {
        this.isRunning = false;
        resolve();
      }
    });
  }

  /**
   * Настройка REST API роутов
   */
  setupRoutes() {
    // API Info
    this.app.get('/api', (req, res) => {
      res.json({
        name: '3D Printer Control Panel API',
        version: '1.0.0',
        endpoints: {
          '/api/printers': 'GET - Список всех принтеров',
          '/api/printers/:id': 'GET - Данные конкретного принтера',
          '/api/printers/:id/status': 'GET - Статус принтера',
          '/api/health': 'GET - Проверка состояния сервера'
        }
      });
    });

    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        connectedClients: this.clients.size
      });
    });

    // Получить статистику принтеров
    this.app.get('/api/statistics', (req, res) => {
      try {
        const stats = this.structuredManager.getStatistics();
        
        res.json({
          success: true,
          statistics: stats,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Получить список всех принтеров (структурированные данные)
    this.app.get('/api/printers', (req, res) => {
      try {
        const optimizedPackage = this.structuredManager.getOptimizedPackage();
        res.json({ 
          success: true, 
          ...optimizedPackage
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Получить данные конкретного принтера (структурированные данные)
    this.app.get('/api/printers/:id', async (req, res) => {
      try {
        const printerId = req.params.id;
        const printerData = this.structuredManager.getPrinterData(printerId);
        
        if (!printerData) {
          return res.status(404).json({ 
            success: false, 
            error: 'Принтер не найден' 
          });
        }
        
        res.json({ 
          success: true, 
          printer: printerData
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Получить статус принтера (структурированные данные)
    this.app.get('/api/printers/:id/status', async (req, res) => {
      try {
        const printerId = req.params.id;
        const printerData = this.structuredManager.getPrinterData(printerId);
        
        if (!printerData) {
          return res.status(404).json({ 
            success: false, 
            error: 'Статус принтера не найден' 
          });
        }
        
        res.json({ 
          success: true, 
          status: printerData.data 
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Главная страница - отдаем web-интерфейс
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'web-interface', 'index.html'));
    });

    // Документация
    this.app.get('/docs/help', (req, res) => {
      const fs = require('fs');
      const docsPath = path.join(__dirname, '..', 'docs', 'WEB_SERVER.md');
      
      try {
        const markdown = fs.readFileSync(docsPath, 'utf8');
        
        // Простой рендеринг markdown в HTML
        const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web-сервер - Документация</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a1628;
            color: #e8f0f7;
            padding: 2rem;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
        }
        h1, h2, h3 { color: #00d4ff; }
        h1 { border-bottom: 2px solid #00d4ff; padding-bottom: 0.5rem; }
        h2 { margin-top: 2rem; border-bottom: 1px solid rgba(0, 212, 255, 0.3); padding-bottom: 0.3rem; }
        code {
            background: rgba(0, 212, 255, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            color: #4dabf7;
            border: 1px solid rgba(0, 212, 255, 0.3);
        }
        pre {
            background: rgba(10, 22, 40, 0.9);
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid rgba(0, 212, 255, 0.3);
            overflow-x: auto;
        }
        pre code {
            background: none;
            border: none;
            padding: 0;
        }
        a {
            color: #4dabf7;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        ul, ol {
            padding-left: 2rem;
        }
        li {
            margin: 0.5rem 0;
        }
    </style>
</head>
<body>
    <pre>${markdown.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    <br><br>
    <a href="/" style="color: #00d4ff;">← Вернуться к панели управления</a>
</body>
</html>
        `;
        
        res.send(html);
      } catch (error) {
        res.status(404).send('Документация не найдена');
      }
    });
  }

  /**
   * Настройка WebSocket для real-time обновлений
   */
  setupWebSocket() {
    this.io.on('connection', (socket) => {
      this.clients.add(socket.id);
      console.log(`[WebServer] 🔌 Клиент подключен: ${socket.id} (всего: ${this.clients.size})`);

      // Отправляем начальные данные с полной информацией
      try {
        const optimizedPackage = this.structuredManager.getOptimizedPackage();
        socket.emit('initial-data', optimizedPackage);
        console.log(`[WebServer] 📦 Отправлены данные: ${optimizedPackage.critical.length} critical, ${optimizedPackage.active.length} active`);
      } catch (error) {
        console.error('[WebServer] Ошибка отправки initial-data:', error);
        socket.emit('initial-data', { critical: [], active: [], stats: {} });
      }

      // Подписка на обновления конкретного принтера
      socket.on('subscribe-printer', (printerId) => {
        socket.join(`printer-${printerId}`);
        console.log(`[WebServer] Клиент ${socket.id} подписался на принтер ${printerId}`);
      });

      // Отписка от обновлений принтера
      socket.on('unsubscribe-printer', (printerId) => {
        socket.leave(`printer-${printerId}`);
        console.log(`[WebServer] Клиент ${socket.id} отписался от принтера ${printerId}`);
      });

      // Отключение клиента
      socket.on('disconnect', () => {
        this.clients.delete(socket.id);
        console.log(`[WebServer] 🔌 Клиент отключен: ${socket.id} (осталось: ${this.clients.size})`);
      });
    });
  }

  /**
   * Отправить обновление данных принтера всем подключенным клиентам
   */
  broadcastPrinterUpdate(printerId, data) {
    if (this.io && this.isRunning) {
      this.io.to(`printer-${printerId}`).emit('printer-update', {
        printerId,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Отправить обновление статуса принтера
   */
  broadcastPrinterStatus(printerId, status) {
    if (this.io && this.isRunning) {
      this.io.emit('printer-status', {
        printerId,
        status,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Получить информацию о сервере
   */
  getInfo() {
    return {
      isRunning: this.isRunning,
      port: this.port,
      connectedClients: this.clients.size,
      url: this.isRunning ? `http://localhost:${this.port}` : null
    };
  }
}

module.exports = WebServer;

