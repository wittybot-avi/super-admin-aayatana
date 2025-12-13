
import React, { useState, useEffect } from 'react';
import { Device, DeviceType, DeviceStatus } from '../../types';
import { DeviceService } from '../../services/deviceService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Plus, Radio, MoreVertical, Trash2, Power, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

export const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState('');
  
  // Register Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    type: 'Smart BMS' as DeviceType,
    serial: '',
    firmwareVersion: '1.0.0',
    notes: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [serialError, setSerialError] = useState<string | null>(null);

  // Row Actions State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const tid = DeviceService.getCurrentTenantId();
    setTenantId(tid);
    loadDevices(tid);

    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadDevices = async (tid: string) => {
    setLoading(true);
    const data = await DeviceService.getDevices(tid);
    setDevices(data);
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSerialError(null);
    const cleanSerial = registerForm.serial.trim();

    if (!cleanSerial) return;

    setIsRegistering(true);
    
    // Check uniqueness
    const isUnique = await DeviceService.isSerialUnique(tenantId, cleanSerial);
    if (!isUnique) {
      setSerialError('This serial number is already registered for this tenant.');
      setIsRegistering(false);
      return;
    }

    try {
      await DeviceService.createDevice({
        tenantId,
        serial: cleanSerial,
        type: registerForm.type,
        firmwareVersion: registerForm.firmwareVersion || '1.0.0',
        notes: registerForm.notes
      });
      
      await loadDevices(tenantId);
      setIsRegisterOpen(false);
      setRegisterForm({ type: 'Smart BMS', serial: '', firmwareVersion: '1.0.0', notes: '' });
      alert('Device registered successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAction = async (e: React.MouseEvent, action: 'active' | 'offline' | 'revoke' | 'delete', deviceId: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    
    if (action === 'delete') {
      if (!confirm('Are you sure you want to permanently delete this device?')) return;
      await DeviceService.deleteDevice(deviceId);
    } else if (action === 'active') {
      await DeviceService.updateDevice(deviceId, { status: 'Active', lastSeenAt: new Date().toISOString() });
    } else if (action === 'offline') {
      await DeviceService.updateDevice(deviceId, { status: 'Offline' });
    } else if (action === 'revoke') {
        if (!confirm('Revoking a device will prevent it from connecting. Continue?')) return;
        await DeviceService.updateDevice(deviceId, { status: 'Revoked' });
    }
    
    await loadDevices(tenantId);
  };

  const toggleMenu = (e: React.MouseEvent, deviceId: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === deviceId ? null : deviceId);
  };

  const deviceTypes: DeviceType[] = ['Smart BMS', 'IoT Gateway', 'Swap Station Reader', 'Telematics Adapter', 'Other'];

  const getStatusVariant = (status: DeviceStatus) => {
      switch(status) {
          case 'Active': return 'success';
          case 'Offline': return 'warning';
          case 'Revoked': return 'error';
          default: return 'neutral';
      }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Tenant Devices</h2>
          <p className="text-sm text-slate-500">Register, monitor, and manage device access for this tenant.</p>
        </div>
        <Button onClick={() => setIsRegisterOpen(true)}>
          <Plus size={16} className="mr-2" /> Register Device
        </Button>
      </div>

      {/* Context Banner */}
      <div className="bg-slate-100 rounded-lg px-4 py-2 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Managing devices for tenant ID: <span className="font-mono font-semibold text-slate-700">{tenantId}</span></span>
        <span>Provisioning rules are set during onboarding; manage live devices here.</span>
      </div>

      {/* Devices Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">
           <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
           Loading devices...
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Radio className="text-slate-400" size={32} />
          </div>
          <h3 className="text-slate-900 font-bold mb-2">No devices registered</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Get started by registering the first BMS, Gateway, or Reader for this tenant.</p>
          <Button variant="outline" onClick={() => setIsRegisterOpen(true)}>Register Device</Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Device Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Serial Number</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Firmware</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Seen</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3 border border-indigo-100">
                        <Radio size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-900">{device.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">{device.serial}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusVariant(device.status)}>
                      {device.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    v{device.firmwareVersion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right relative">
                    <button 
                      onClick={(e) => toggleMenu(e, device.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {/* Action Menu */}
                    {activeMenuId === device.id && (
                      <div className="absolute right-8 top-8 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 text-left animate-in fade-in zoom-in-95 duration-150">
                        {device.status !== 'Revoked' ? (
                            <>
                                <button onClick={(e) => handleAction(e, 'active', device.id)} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center">
                                    <Power size={14} className="mr-2" /> Mark Active
                                </button>
                                <button onClick={(e) => handleAction(e, 'offline', device.id)} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                                    <WifiOff size={14} className="mr-2" /> Mark Offline
                                </button>
                                <button onClick={(e) => handleAction(e, 'revoke', device.id)} className="w-full px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center">
                                    <AlertCircle size={14} className="mr-2" /> Revoke Access
                                </button>
                            </>
                        ) : (
                            <div className="px-4 py-2 text-xs text-slate-400 italic border-b border-slate-100">
                                Revoked devices cannot be modified.
                            </div>
                        )}
                        <div className="border-t border-slate-100 my-1"></div>
                        <button onClick={(e) => handleAction(e, 'delete', device.id)} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                          <Trash2 size={14} className="mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register Device Modal */}
      <Modal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        title="Register New Device"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Device Type</label>
            <div className="relative">
                <select 
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none shadow-sm transition-all"
                    value={registerForm.type}
                    onChange={(e) => setRegisterForm({...registerForm, type: e.target.value as DeviceType})}
                >
                    {deviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
          </div>

          <Input 
            label="Serial Number" 
            placeholder="e.g. BMS-X99-001" 
            value={registerForm.serial}
            onChange={(e) => {
                setRegisterForm({...registerForm, serial: e.target.value});
                setSerialError(null);
            }}
            required
            error={serialError || undefined}
          />

          <Input 
            label="Initial Firmware Version" 
            placeholder="e.g. 1.0.0" 
            value={registerForm.firmwareVersion}
            onChange={(e) => setRegisterForm({...registerForm, firmwareVersion: e.target.value})}
          />

          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes (Optional)</label>
             <textarea 
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all min-h-[80px]"
                placeholder="Deployment details or location..."
                value={registerForm.notes}
                onChange={(e) => setRegisterForm({...registerForm, notes: e.target.value})}
             />
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsRegisterOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isRegistering}>Register Device</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
