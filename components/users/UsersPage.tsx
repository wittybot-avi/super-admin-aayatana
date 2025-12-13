
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { UserService } from '../../services/userService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Plus, Search, MoreVertical, Trash2, CheckCircle, Ban, Mail } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState('');
  
  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ fullName: '', email: '', role: 'Viewer' as UserRole });
  const [isInviting, setIsInviting] = useState(false);

  // Row Actions State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const tid = UserService.getCurrentTenantId();
    setTenantId(tid);
    loadUsers(tid);

    // Click outside to close menu
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadUsers = async (tid: string) => {
    setLoading(true);
    const data = await UserService.getUsers(tid);
    setUsers(data);
    setLoading(false);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.fullName || !inviteForm.email) return;

    setIsInviting(true);
    try {
      await UserService.createUser({
        tenantId,
        fullName: inviteForm.fullName,
        email: inviteForm.email,
        role: inviteForm.role,
      });
      // Refresh list
      await loadUsers(tenantId);
      setIsInviteOpen(false);
      setInviteForm({ fullName: '', email: '', role: 'Viewer' });
      // In a real app, we'd show a toast here
      alert('Invitation sent successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setIsInviting(false);
    }
  };

  const handleAction = async (e: React.MouseEvent, action: 'activate' | 'disable' | 'delete', userId: string) => {
    e.stopPropagation(); // Prevent closing menu immediately
    setActiveMenuId(null);
    
    if (action === 'delete') {
      if (!confirm('Are you sure you want to remove this user?')) return;
      await UserService.deleteUser(userId);
    } else if (action === 'activate') {
      await UserService.updateUser(userId, { status: 'Active' });
    } else if (action === 'disable') {
      await UserService.updateUser(userId, { status: 'Disabled' });
    }
    
    await loadUsers(tenantId);
  };

  const toggleMenu = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === userId ? null : userId);
  };

  const roles: UserRole[] = ['Tenant Admin', 'Ops Manager', 'Technician', 'Data Analyst', 'Finance Officer', 'Viewer'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Tenant Users</h2>
          <p className="text-sm text-slate-500">Manage access and role assignments for this tenant.</p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)}>
          <Plus size={16} className="mr-2" /> Invite User
        </Button>
      </div>

      {/* Tenant Context Banner */}
      <div className="bg-slate-100 rounded-lg px-4 py-2 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Scoping users for tenant ID: <span className="font-mono font-semibold text-slate-700">{tenantId}</span></span>
        <span>Initial users may have been created during onboarding.</span>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">
           <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
           Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="text-slate-400" size={32} />
          </div>
          <h3 className="text-slate-900 font-bold mb-2">No users found</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Get started by inviting the first administrator or operator to this tenant.</p>
          <Button variant="outline" onClick={() => setIsInviteOpen(true)}>Invite User</Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold mr-3 border border-teal-200">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{user.fullName}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      user.status === 'Active' ? 'success' : 
                      user.status === 'Pending' ? 'warning' : 'neutral'
                    }>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right relative">
                    <button 
                      onClick={(e) => toggleMenu(e, user.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {/* Action Menu Dropdown */}
                    {activeMenuId === user.id && (
                      <div className="absolute right-8 top-8 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 text-left animate-in fade-in zoom-in-95 duration-150">
                        {user.status !== 'Active' && (
                            <button 
                                onClick={(e) => handleAction(e, 'activate', user.id)}
                                className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center"
                            >
                                <CheckCircle size={14} className="mr-2" /> Activate
                            </button>
                        )}
                        {user.status !== 'Disabled' && (
                            <button 
                                onClick={(e) => handleAction(e, 'disable', user.id)}
                                className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                            >
                                <Ban size={14} className="mr-2" /> Disable
                            </button>
                        )}
                        <div className="border-t border-slate-100 my-1"></div>
                        <button 
                             onClick={(e) => handleAction(e, 'delete', user.id)}
                             className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 size={14} className="mr-2" /> Remove
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

      {/* Invite User Modal */}
      <Modal 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
        title="Invite User"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-5">
          <Input 
            label="Full Name" 
            placeholder="e.g. Sarah Connor" 
            value={inviteForm.fullName}
            onChange={(e) => setInviteForm({...inviteForm, fullName: e.target.value})}
            required
            autoFocus
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="e.g. sarah@skynet.com" 
            value={inviteForm.email}
            onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
            required
          />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
            <div className="relative">
                <select 
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none shadow-sm transition-all"
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value as UserRole})}
                >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isInviting}>Send Invitation</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

// Helper icon for empty state
function UsersIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}
