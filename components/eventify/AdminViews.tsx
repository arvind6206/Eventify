import { useState } from "react";
import { UserRole } from "./types";
import { formatMoney, formatDate } from "./ui";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  _count?: {
    bookings: number;
    reservations: number;
    payments: number;
  };
}

interface UsersViewProps {
  users: User[];
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onDeleteUser: (userId: string) => void;
  onToggleActive: (userId: string, isActive: boolean) => void;
}

export function UsersView({ users, onRoleChange, onDeleteUser, onToggleActive }: UsersViewProps) {
  const [search, setSearch] = useState("");
  
  const filteredUsers = users.filter(user =>
    `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500">Manage platform users and their roles</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="text-sm text-slate-500">
            {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">User</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Role</th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-slate-700">Bookings</th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-slate-700">Payments</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Joined</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={user.role}
                      onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="USER">User</option>
                      <option value="ORGANIZER">Organizer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onToggleActive(user.id, !user.isActive)}
                      className={`inline-flex items-center justify-center w-16 py-1.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-medium">
                      {user._count?.bookings || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                      {user._count?.payments || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-slate-600">{formatDate(user.createdAt)}</p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}