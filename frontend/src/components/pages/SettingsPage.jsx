import React from 'react';
import { useCrm } from '../../context/CrmContext';

const SettingsPage = () => {
  const { settings, updateSettings } = useCrm();

  // Debug log
  console.log('Dark mode setting:', settings.darkMode);

  return (
    <div className="settings-container">
      <div className="settings-section">
        <div className="settings-section-header">
          <h2>General Settings</h2>
        </div>

        <div className="settings-group">
          {/* Dark Mode Toggle */}
          <div className="settings-item">
            <div className="settings-item-content">
              <h3>Dark Mode</h3>
              <p>Toggle dark mode for the application</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => updateSettings({ darkMode: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
            {/* TEMP: Force dark mode button for testing */}
            <button style={{ marginLeft: 16 }} onClick={() => updateSettings({ darkMode: true })}>
              Force Dark Mode
            </button>
            <button style={{ marginLeft: 8 }} onClick={() => updateSettings({ darkMode: false })}>
              Force Light Mode
            </button>
          </div>

          {/* Email Notifications */}
          <div className="settings-item">
            <div className="settings-item-content">
              <h3>Email Notifications</h3>
              <p>Receive email notifications for important updates</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => updateSettings({ emailNotifications: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Push Notifications */}
          <div className="settings-item">
            <div className="settings-item-content">
              <h3>Push Notifications</h3>
              <p>Receive push notifications in your browser</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => updateSettings({ pushNotifications: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 