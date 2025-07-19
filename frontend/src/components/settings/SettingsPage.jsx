import React from 'react';
import { useCrm } from '../../context/CrmContext';

const SettingsPage = () => {
  const { settings, updateSetting } = useCrm();

  const handleToggle = (settingName) => {
    updateSetting(settingName, !settings[settingName]);
  };

  const handleLanguageChange = (e) => {
    updateSetting('language', e.target.value);
  };

  const settingsSections = [
    {
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: '🔔',
      content: (
        <div className="settings-group">
          <div className="settings-item">
            <div className="settings-item-content">
              <h3>Push Notifications</h3>
              <p>Receive notifications for important updates</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={!!settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="settings-item">
            <div className="settings-item-content">
              <h3>Email Notifications</h3>
              <p>Receive email notifications for updates</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={!!settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      ),
    },
    {
      title: 'Appearance',
      description: 'Customize your app experience',
      icon: '🎨',
      content: (
        <div className="settings-group">
          <div className="settings-item">
            <div className="settings-item-content">
              <h3>Dark Mode</h3>
              <p>Switch between light and dark themes</p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={!!settings.darkMode}
                onChange={() => handleToggle('darkMode')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1>Settings</h1>
      <div className="settings-container">
        {settingsSections.map((section) => (
          <div key={section.title} className="settings-section">
            <div className="settings-section-header">
              <span className="settings-icon">{section.icon}</span>
              <div>
                <h2>{section.title}</h2>
                <p>{section.description}</p>
              </div>
            </div>
            {section.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage; 