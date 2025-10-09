import UserManager from './user-manager.js';
import crypto from 'crypto';

class SuperAdminPanel {
  constructor() {
    this.userManager = new UserManager();
    this.isActive = false;
  }

  async init() {
    const currentUser = await window.electronAPI.storeGet('currentUser', null);
    if (currentUser && currentUser.isSuperAdmin) {
      this.isActive = true;
      this.createSecretButton();
    }
  }

  createSecretButton() {
    const header = document.querySelector('h1');
    if (!header) return;

    const text = header.textContent;
    const dIndex = text.indexOf('D');
    if (dIndex === -1) return;

    const range = document.createRange();
    const textNode = header.childNodes[0];
    range.setStart(textNode, dIndex);
    range.setEnd(textNode, dIndex + 1);

    const rect = range.getBoundingClientRect();
    
    const btn = document.createElement('div');
    btn.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      cursor: pointer;
      z-index: 99999;
      background: transparent;
    `;
    
    btn.addEventListener('click', () => this.showPanel());
    document.body.appendChild(btn);
  }

  showPanel() {
    const modal = document.createElement('div');
    modal.id = 'superAdminModal';
    modal.style.cssText = `
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 999999;
      overflow-y: auto;
      padding: 20px;
    `;

    const users = this.userManager.getAllUsersWithPasswords();
    
    modal.innerHTML = `
      <div style="max-width: 1000px; margin: 40px auto; background: #1a1a1a; border-radius: 20px; padding: 30px; color: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
          <h2 style="color: #ff0000; margin: 0;">SUPERADMIN PANEL</h2>
          <button id="closeSuperAdmin" style="background: #ff0000; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">✕ Close</button>
        </div>

        <div style="background: #2a2a2a; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #ff6b6b; margin-bottom: 15px;">All Users</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #333; text-align: left;">
                <th style="padding: 12px; border: 1px solid #444;">Username</th>
                <th style="padding: 12px; border: 1px solid #444;">Display Name</th>
                <th style="padding: 12px; border: 1px solid #444;">Role</th>
                <th style="padding: 12px; border: 1px solid #444;">Password Hash</th>
                <th style="padding: 12px; border: 1px solid #444;">Active</th>
                <th style="padding: 12px; border: 1px solid #444;">Created</th>
                <th style="padding: 12px; border: 1px solid #444;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(user => `
                <tr style="border-bottom: 1px solid #444;">
                  <td style="padding: 12px; border: 1px solid #444;">${user.username}</td>
                  <td style="padding: 12px; border: 1px solid #444;">${user.displayName}</td>
                  <td style="padding: 12px; border: 1px solid #444;">
                    <span style="background: ${user.role === 'admin' ? '#ff0000' : '#0088cc'}; padding: 4px 8px; border-radius: 4px; font-size: 11px;">
                      ${user.role === 'admin' ? '👑 ADMIN' : '👤 OPERATOR'}
                    </span>
                  </td>
                  <td style="padding: 12px; border: 1px solid #444; font-family: monospace; font-size: 10px; word-break: break-all; max-width: 200px;">${user.passwordHash}</td>
                  <td style="padding: 12px; border: 1px solid #444;">${user.isActive ? '✅' : '❌'}</td>
                  <td style="padding: 12px; border: 1px solid #444; font-size: 11px;">${new Date(user.createdAt).toLocaleString('ru-RU')}</td>
                  <td style="padding: 12px; border: 1px solid #444;">
                    <button onclick="superAdminPanel.setPassword('${user.id}')" style="background: #ffc107; color: #000; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; margin: 2px;">Set Password</button>
                    <button onclick="superAdminPanel.deleteUser('${user.id}')" style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; margin: 2px;">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="background: #2a2a2a; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #ff6b6b; margin-bottom: 15px;">Raw Data</h3>
          <textarea readonly style="width: 100%; height: 300px; background: #1a1a1a; color: #0f0; border: 1px solid #444; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px;">${JSON.stringify(users, null, 2)}</textarea>
        </div>

        <div style="background: #2a2a2a; padding: 20px; border-radius: 10px;">
          <h3 style="color: #ff6b6b; margin-bottom: 15px;">Actions</h3>
          <button onclick="superAdminPanel.clearAllData()" style="background: #dc3545; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; margin-right: 10px;">🗑️ Clear All Data</button>
          <button onclick="superAdminPanel.exportData()" style="background: #28a745; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">💾 Export Data</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    document.getElementById('closeSuperAdmin').addEventListener('click', () => {
      modal.remove();
    });
  }

  setPassword(userId) {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;

    const users = this.userManager.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    user.passwordHash = crypto.createHash('sha256').update(newPassword + 'salt_3dc_panel_2025').digest('hex');
    
    const Store = require('electron-store');
    const store = new Store({ name: 'users-data', encryptionKey: 'y0ur-s3cr3t-k3y-f0r-us3r-d4t4' });
    store.set('users', users);

    alert(`Password changed for ${user.username}\nNew password: ${newPassword}`);
    this.showPanel();
  }

  deleteUser(userId) {
    if (!confirm('Delete this user?')) return;

    const users = this.userManager.getAllUsers().filter(u => u.id !== userId);
    
    const Store = require('electron-store');
    const store = new Store({ name: 'users-data', encryptionKey: 'y0ur-s3cr3t-k3y-f0r-us3r-d4t4' });
    store.set('users', users);

    alert('User deleted');
    this.showPanel();
  }

  clearAllData() {
    if (!confirm('Clear ALL data? This cannot be undone!')) return;
    if (!confirm('Are you ABSOLUTELY sure?')) return;

    const Store = require('electron-store');
    
    const usersStore = new Store({ name: 'users-data', encryptionKey: 'y0ur-s3cr3t-k3y-f0r-us3r-d4t4' });
    const shiftsStore = new Store({ name: 'shifts-data', encryptionKey: 'y0ur-s3cr3t-k3y-f0r-sh1ft-d4t4' });
    const reportsStore = new Store({ name: 'reports-data', encryptionKey: 'y0ur-s3cr3t-k3y-f0r-r3p0rts-d4t4' });
    
    usersStore.clear();
    shiftsStore.clear();
    reportsStore.clear();

    alert('All data cleared. Reload the application.');
    window.location.href = 'setup-admin.html';
  }

  exportData() {
    const users = this.userManager.getAllUsersWithPasswords();
    const data = JSON.stringify(users, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-backup-${Date.now()}.json`;
    a.click();
  }
}

let superAdminPanel;

window.addEventListener('DOMContentLoaded', () => {
  superAdminPanel = new SuperAdminPanel();
  superAdminPanel.init();
});

export default SuperAdminPanel;

