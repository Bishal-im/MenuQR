"use client";

import { useEffect, useState } from "react";
import { getUsers, User, deleteUser, updateUserRole, PlatformSettings } from "@/services/superAdminService";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Shield, 
  User as UserIcon,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Trash2
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: ""
  });


  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsers();
      setUsers(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    const res = await deleteUser(deleteModal.id);
    if (res.success) {
      setDeleteModal({ ...deleteModal, isOpen: false });
      const data = await getUsers();
      setUsers(data);
    } else {
      alert("Failed to delete user: " + res.error);
    }
    setIsDeleting(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      const data = await getUsers();
      setUsers(data);
    } else {
      alert("Failed to update role");
    }
  };


  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'admin': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'waiter': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">User Management</h1>
          <p className="text-neutral-500 font-medium">Monitor and manage all users across the platform.</p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-3xl border border-neutral-800/50">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 px-5 py-3 glass rounded-xl border border-neutral-800/50 text-xs font-black text-neutral-400 hover:text-white transition-all flex-grow md:flex-grow-0">
            <Filter className="w-4 h-4" />
            All Roles
          </button>
        </div>
      </div>

      {/* Table-like List */}
      <div className="glass rounded-[2rem] border border-neutral-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800/50 bg-neutral-900/30">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">User</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Role</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Creation Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Created At</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/30">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-16 bg-neutral-900/10" />
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center text-orange-500 border border-neutral-700 font-bold group-hover:bg-orange-500 group-hover:text-white transition-all">
                          {user.name ? user.name[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white">{user.name || 'Anonymous'}</span>
                          <span className="text-xs text-neutral-500 font-medium">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${getRoleColor(user.role)}`}>
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <code className="text-[10px] bg-neutral-900 px-2 py-1 rounded-lg text-neutral-400 border border-neutral-800">
                      <span className="text-neutral-400 font-medium">Auto-Synced</span>
                      </code>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs font-medium">{user.createdAt}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <select 
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-[10px] font-black uppercase text-neutral-400 focus:border-orange-500 outline-none transition-all"
                        >
                          <option value="customer">Customer</option>
                          <option value="waiter">Waiter</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, id: user.id, name: user.email })}
                          className="p-2 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-neutral-500 font-bold">No users found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-6">
        <p className="text-xs text-neutral-500 font-medium">Showing <span className="text-white font-bold">{filteredUsers.length}</span> platform users</p>
        <div className="flex gap-2">
          <button className="p-3 glass border border-neutral-800/50 rounded-xl text-neutral-500 hover:text-white disabled:opacity-30" disabled>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-3 glass border border-neutral-800/50 rounded-xl text-neutral-500 hover:text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        itemName={deleteModal.name}
        description="Are you sure you want to delete this user? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>

  );
}
