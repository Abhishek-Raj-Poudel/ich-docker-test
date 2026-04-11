"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ArrowUpDown,
  Lock,
  Mail,
  MoreHorizontal,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  getAdminUsers, 
  UserListItem, 
  getRoleStyle, 
  getStatusStyle,
  getRoleLabel,
  getStatusLabel,
  getUserName,
} from "@/lib/admin";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminUsersListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    const result = await getAdminUsers({ 
      page, 
      per_page: 10,
      search: searchQuery || undefined,
    });
    
    if (result.success && result.data) {
      setUsers(result.data);
      setTotal(result.total || 0);
      setCurrentPage(result.current_page || 1);
      setLastPage(result.last_page || 1);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const toggleSelectAll = () => {
    if (selectedItems.length === users.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(users.map(u => u.id));
    }
  };

  const toggleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-light tracking-tight text-neutral-900 font-serif lowercase first-letter:uppercase">
            User Management
          </h1>
          <p className="text-neutral-500 text-sm">
            Control access, roles and verify platform participants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => fetchUsers(currentPage)}
            className="h-11 px-4 rounded-xl border-neutral-100 bg-white gap-2 shadow-none text-neutral-700 font-medium"
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
          <Button className="rounded-xl bg-red-600 text-white hover:bg-red-700 gap-2 h-11 px-6 shadow-none font-medium">
            <UserPlus className="size-4" />
            Add New User
          </Button>
        </div>
      </motion.div>

      {/* Filters Corner */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            placeholder="Search users by name, email or ID..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-12 h-12 bg-white border-neutral-100 rounded-xl shadow-none focus-visible:ring-red-600"
          />
        </div>
        <Button variant="outline" className="h-12 border-neutral-100 bg-white rounded-xl gap-3 shadow-none text-neutral-700 font-medium justify-between px-4">
          <span className="flex items-center gap-2"><Filter className="size-4" /> All Roles</span>
          <ChevronRight className="size-4 rotate-90 opacity-40" />
        </Button>
        <Button variant="outline" className="h-12 border-neutral-100 bg-white rounded-xl gap-3 shadow-none text-neutral-700 font-medium justify-between px-4">
          <span className="flex items-center gap-2"><ArrowUpDown className="size-4" /> Date Joined</span>
          <ChevronRight className="size-4 rotate-90 opacity-40" />
        </Button>
      </motion.div>

      {/* Bulk actions */}
      {selectedItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-neutral-900 text-white rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
             <p className="text-[10px] font-bold uppercase tracking-widest pl-2">{selectedItems.length} Selected</p>
             <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest h-8">Suspend</Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest h-8 text-red-400">Delete</Button>
             </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])} className="text-white/50 text-[10px] uppercase font-bold tracking-widest h-8">Clear</Button>
        </motion.div>
      )}

      {/* Main Users Table */}
      <motion.div variants={item} className="bg-white border border-neutral-100 rounded-xl overflow-hidden shadow-none mb-20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="p-5 w-10">
                  <input 
                    type="checkbox" 
                    className="size-4 rounded accent-red-600"
                    onChange={toggleSelectAll}
                    checked={users.length > 0 && selectedItems.length === users.length}
                  />
                </th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400">User Information</th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400">Role</th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400">Status</th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400 text-center">KYC</th>
                <th className="p-5 uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400">Joined</th>
                <th className="p-5 text-right uppercase text-[9px] font-bold tracking-[0.2em] text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="size-8 animate-spin text-red-500" />
                      <p className="text-sm text-neutral-500">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="size-12 bg-neutral-100 rounded-full flex items-center justify-center">
                        <Mail className="size-6 text-neutral-400" />
                      </div>
                      <p className="text-sm text-neutral-500">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleLabel = getRoleLabel(user.role.id);
                  const statusLabel = getStatusLabel(user.is_active, user.kyc_status);
                  
                  return (
                    <tr key={user.id} className="group hover:bg-neutral-50/50 transition-colors">
                      <td className="p-5">
                        <input 
                          type="checkbox" 
                          className="size-4 rounded accent-red-600"
                          checked={selectedItems.includes(user.id)}
                          onChange={() => toggleSelectItem(user.id)}
                        />
                      </td>
                       <td className="p-5">
                         <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-neutral-100 border border-neutral-100 flex items-center justify-center text-neutral-400 font-bold group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                               {getUserName(user).charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-0.5">
                               <Link href={`/admin/users/${user.id}`} className="font-bold text-neutral-900 group-hover:text-red-600 transition-colors block">
                                  {getUserName(user)}
                               </Link>
                               <p className="text-[10px] text-neutral-400 font-mono">{user.email}</p>
                            </div>
                         </div>
                       </td>
                      <td className="p-5">
                        <span className={cn("px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest border", getRoleStyle(roleLabel))}>
                           {roleLabel}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={cn("px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest border", getStatusStyle(user.is_active, user.kyc_status))}>
                           {statusLabel}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center">
                          {user.kyc_status === "approved" ? (
                            <CheckCircle2 className="size-5 text-teal-500" />
                          ) : user.kyc_status === "pending" ? (
                            <Clock className="size-5 text-amber-500" />
                          ) : (
                            <XCircle className="size-5 text-neutral-300" />
                          )}
                        </div>
                      </td>
                      <td className="p-5 whitespace-nowrap">
                         <p className="text-xs font-medium text-neutral-900">
                           {new Date(user.created_at).toLocaleDateString("en-GB", { 
                             day: "numeric", 
                             month: "short", 
                             year: "numeric" 
                           })}
                         </p>
                         <p className="text-[8px] text-neutral-400 uppercase font-bold tracking-widest">via Web Portal</p>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Link href={`/admin/users/${user.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 rounded-xl">View</Button>
                           </Link>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-300 hover:text-neutral-600">
                              <MoreHorizontal className="size-4" />
                           </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-5 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
           <p className="text-xs text-neutral-500">
             Showing <span className="font-medium text-neutral-900">{(currentPage - 1) * 10 + 1}</span> to{" "}
             <span className="font-medium text-neutral-900">{Math.min(currentPage * 10, total)}</span> of{" "}
             <span className="font-medium text-neutral-900">{total}</span> users
           </p>
           <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => fetchUsers(currentPage - 1)}
                className="h-8 text-[9px] uppercase font-bold tracking-widest bg-white border-neutral-100 px-4 rounded-xl"
              >
                Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage >= lastPage}
                onClick={() => fetchUsers(currentPage + 1)}
                className="h-8 text-[9px] uppercase font-bold tracking-widest bg-white border-neutral-100 hover:bg-neutral-50 px-4 rounded-xl"
              >
                Next
              </Button>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
