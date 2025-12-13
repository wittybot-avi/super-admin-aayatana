
import React, { useState, useEffect } from 'react';
import { TenantSettings, TenantRegion, SamplingProfile, NotificationChannel } from '../../types';
import { SettingsService } from '../../services/settingsService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Checkbox } from '../ui/Checkbox';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { RotateCcw, Save, Shield, Globe, Database, Bell, AlertTriangle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const tid = SettingsService.getCurrentTenantId();
    setTenantId(tid);
    loadSettings(tid);
  }, []);

  useEffect(() => {
    if (settings && originalSettings) {
        const currentStr = JSON.stringify({...settings, updatedAt: ''});
        const originalStr = JSON.stringify({...originalSettings, updatedAt: ''});
        setIsDirty(currentStr !== originalStr);
    }
  }, [settings, originalSettings]);

  const loadSettings = async (tid: string) => {
    setLoading(true);
    const data = await SettingsService.getSettings(tid);
    setSettings(data);
    setOriginalSettings(JSON.parse(JSON.stringify(data)));
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await SettingsService.saveSettings(tenantId, settings);
    setOriginalSettings(JSON.parse(JSON.stringify(settings)));
    setSaving(false);
    alert('Settings updated successfully (mock)');
  };

  const handleReset = () => {
    if (confirm('Discard all unsaved changes?')) {
        setSettings(JSON.parse(JSON.stringify(originalSettings)));
    }
  };

  const updateSetting = <K extends keyof TenantSettings>(key: K, value: TenantSettings[K]) => {
      setSettings(prev => prev ? ({ ...prev, [key]: value }) : null);
  };

  const toggleChannel = (channel: NotificationChannel) => {
      if (!settings) return;
      const current = settings.notificationChannels;
      const next = current.includes(channel) 
          ? current.filter(c => c !== channel)
          : [...current, channel];
      updateSetting('notificationChannels', next);
  };

  const handleTestNotification = () => {
      alert('Test notification sent to configured channels (mock)');
  };

  if (loading || !settings) {
    return (
        <div className="text-center py-20 text-slate-500">
           <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
           Loading settings...
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Tenant Settings</h2>
          <p className="text-sm text-slate-500">Tenant defaults for compliance, retention, notifications, and security.</p>
        </div>
        <div className="flex items-center space-x-3">
          {isDirty && <Badge variant="warning">Unsaved Changes</Badge>}
          <Button variant="ghost" onClick={handleReset} disabled={!isDirty || saving}>
             <RotateCcw size={16} className="mr-2" /> Reset
          </Button>
          <Button onClick={handleSave} isLoading={saving} disabled={!isDirty}>
             <Save size={16} className="mr-2" /> Save Settings
          </Button>
        </div>
      </div>

      {/* Helper Context */}
      <div className="bg-slate-100 rounded-lg px-4 py-2 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Managing settings for tenant ID: <span className="font-mono font-semibold text-slate-700">{tenantId}</span></span>
        <span>Onboarding sets initial defaults; refine operational settings here.</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Region & Compliance */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Globe size={20} /></div>
                  <h3 className="font-bold text-slate-900">Region & Compliance</h3>
              </div>
              <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data Region</label>
                    <div className="relative">
                        <select 
                            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none shadow-sm transition-all"
                            value={settings.region}
                            onChange={(e) => updateSetting('region', e.target.value as TenantRegion)}
                        >
                            <option value="INDIA">India (Mumbai)</option>
                            <option value="EU">Europe (Frankfurt)</option>
                            <option value="GLOBAL">Global / US (Virginia)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                      <div className="mr-4">
                          <label className="block text-sm font-semibold text-slate-700">Battery Aadhaar / DPP Readiness</label>
                          <p className="text-xs text-slate-500 mt-1">Readiness enables stricter identity + provenance defaults.</p>
                      </div>
                      <Switch checked={settings.dppReadiness} onChange={(v) => updateSetting('dppReadiness', v)} />
                  </div>
              </div>
          </div>

          {/* Data Retention */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><Database size={20} /></div>
                  <h3 className="font-bold text-slate-900">Data Retention & Sampling</h3>
              </div>
              <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Data Retention Period</label>
                    <div className="relative">
                        <select 
                            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none shadow-sm transition-all"
                            value={settings.retentionDays}
                            onChange={(e) => updateSetting('retentionDays', Number(e.target.value) as any)}
                        >
                            <option value={30}>30 Days</option>
                            <option value={90}>90 Days</option>
                            <option value={180}>180 Days</option>
                            <option value={365}>365 Days</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                  </div>

                   <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sampling Profile</label>
                    <div className="relative">
                        <select 
                            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none shadow-sm transition-all"
                            value={settings.samplingProfile}
                            onChange={(e) => updateSetting('samplingProfile', e.target.value as SamplingProfile)}
                        >
                            <option value="HIGH_FREQ_1S">High Frequency (1s)</option>
                            <option value="BALANCED_5S">Balanced (5s)</option>
                            <option value="LOW_FREQ_30S">Low Frequency (30s)</option>
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">Actual device sampling is enforced at VoltEdge / gateway policy later.</p>
                  </div>
              </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Bell size={20} /></div>
                  <h3 className="font-bold text-slate-900">Notifications</h3>
              </div>
              <div className="space-y-4">
                  <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-700">Active Channels</label>
                      <div className="flex flex-col space-y-2">
                        <Checkbox checked={settings.notificationChannels.includes('EMAIL')} onChange={() => toggleChannel('EMAIL')} label="Email" />
                        <Checkbox checked={settings.notificationChannels.includes('SMS')} onChange={() => toggleChannel('SMS')} label="SMS" />
                        <Checkbox checked={settings.notificationChannels.includes('WHATSAPP_WEBHOOK')} onChange={() => toggleChannel('WHATSAPP_WEBHOOK')} label="WhatsApp Webhook" />
                      </div>
                  </div>

                  {settings.notificationChannels.includes('WHATSAPP_WEBHOOK') && (
                      <div className="pt-2 animate-in slide-in-from-top-2">
                          <Input 
                              label="Webhook URL" 
                              placeholder="https://api.whatsapp.com/send" 
                              value={settings.webhookUrl} 
                              onChange={(e) => updateSetting('webhookUrl', e.target.value)}
                          />
                      </div>
                  )}

                  <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={handleTestNotification}>Send Test Notification</Button>
                  </div>
              </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Shield size={20} /></div>
                  <h3 className="font-bold text-slate-900">Security Policies</h3>
              </div>
              <div className="space-y-6">
                  <div className="flex items-start justify-between">
                      <div className="mr-4">
                          <label className="block text-sm font-semibold text-slate-700">Require MFA</label>
                          <p className="text-xs text-slate-500 mt-1">Enforce Multi-Factor Authentication for all Admin roles.</p>
                      </div>
                      <Switch checked={settings.requireMfaAdmins} onChange={(v) => updateSetting('requireMfaAdmins', v)} />
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="mr-4">
                            <label className="block text-sm font-semibold text-slate-700">IP Allowlist</label>
                            <p className="text-xs text-slate-500 mt-1">Restrict API key usage to specific IP addresses or CIDR blocks.</p>
                        </div>
                        <Switch checked={settings.apiIpAllowlistEnabled} onChange={(v) => updateSetting('apiIpAllowlistEnabled', v)} />
                    </div>

                    {settings.apiIpAllowlistEnabled && (
                        <div className="animate-in slide-in-from-top-2">
                            <Textarea 
                                placeholder="192.168.1.1&#10;10.0.0.0/24" 
                                rows={4}
                                value={settings.ipAllowlist.join('\n')}
                                onChange={(e) => updateSetting('ipAllowlist', e.target.value.split('\n'))}
                            />
                            <p className="text-xs text-slate-400 mt-2">Enter one IP or CIDR per line.</p>
                        </div>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg flex items-start text-xs text-slate-500">
                      <AlertTriangle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                      These settings will enforce access controls once backend auth is integrated.
                  </div>
              </div>
          </div>

      </div>
    </div>
  );
};
