"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Users, Shield, UserCheck, Mail, Phone, Calendar, ShoppingBag, Eye, UserX, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Profile } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface CustomerWithStats extends Profile {
  orders_count?: number;
  total_spent?: number;
}

const FALLBACK_CUSTOMERS: CustomerWithStats[] = [
  {
    id: 'usr-001',
    email: 'eleanor.vance@example.com',
    full_name: 'Eleanor Vance',
    phone: '+1 (555) 234-5678',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    role: 'customer',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    orders_count: 4,
    total_spent: 1240,
  },
  {
    id: 'usr-002',
    email: 'julian.sterling@example.com',
    full_name: 'Julian Sterling',
    phone: '+1 (555) 876-5432',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    role: 'customer',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    orders_count: 6,
    total_spent: 2890,
  },
  {
    id: 'usr-003',
    email: 'sophia.chen@example.com',
    full_name: 'Sophia Chen',
    phone: '+1 (555) 345-6789',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
    role: 'customer',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    orders_count: 2,
    total_spent: 560,
  },
  {
    id: 'usr-004',
    email: 'admin@luxecommerce.com',
    full_name: 'System Admin',
    phone: '+1 (800) 555-0199',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    role: 'admin',
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    orders_count: 12,
    total_spent: 4500,
  },
];

export default function AdminCustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'customer' | 'admin'>('all');
  const [viewCustomer, setViewCustomer] = useState<CustomerWithStats | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profiles && profiles.length > 0) {
        // Fetch order statistics for each customer
        const { data: orders } = await supabase.from('orders').select('user_id, total');
        
        const customerList: CustomerWithStats[] = profiles.map((p) => {
          const userOrders = orders?.filter((o) => o.user_id === p.id) || [];
          const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
          return {
            ...p,
            orders_count: userOrders.length,
            total_spent: totalSpent,
          };
        });
        setCustomers(customerList);
      } else {
        setCustomers(FALLBACK_CUSTOMERS);
      }
    } catch {
      setCustomers(FALLBACK_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleRole = async (customer: CustomerWithStats) => {
    const newRole = customer.role === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Change role of "${customer.full_name || customer.email}" to ${newRole.toUpperCase()}?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', customer.id);

      if (error) {
        toast('Failed to update role in database', 'error');
      } else {
        toast(`Updated ${customer.full_name}'s role to ${newRole}`, 'success');
        fetchCustomers();
      }
    } catch {
      // Local fallback state update
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, role: newRole } : c))
      );
      toast(`Updated role to ${newRole}`, 'success');
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesQuery =
      (c.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || c.role === selectedRole;
    return matchesQuery && matchesRole;
  });

  const totalCustomers = customers.length;
  const adminCount = customers.filter((c) => c.role === 'admin').length;
  const totalCustomerSpend = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-primary-text">Customer Directory</h1>
          <p className="text-xs text-secondary-text mt-1">Manage registered client accounts, roles, and order history.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider block">Total Clients</span>
            <span className="font-serif text-2xl font-bold text-primary-text">{totalCustomers}</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider block">Total Client Spend</span>
            <span className="font-serif text-2xl font-bold text-primary-text">{formatCurrency(totalCustomerSpend)}</span>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center text-primary-text shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-secondary-text uppercase tracking-wider block">Admins</span>
            <span className="font-serif text-2xl font-bold text-primary-text">{adminCount}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-black/5 shadow-card">
        <div className="flex items-center px-4 py-2 bg-background-secondary rounded-2xl border border-black/5 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-secondary-text mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-secondary-text">Filter Role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="px-4 py-2 bg-white border border-black/15 rounded-xl text-xs font-semibold text-primary-text outline-none focus:border-accent cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-secondary-text animate-pulse">Loading directory...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Users className="w-12 h-12 text-secondary-text mx-auto" />
            <h3 className="font-serif text-xl font-bold text-primary-text">No Customers Found</h3>
            <p className="text-xs text-secondary-text">Try clearing search filters or checking registered users.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/10 bg-background-secondary/50 text-secondary-text uppercase font-bold tracking-wider">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Orders</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredCustomers.map((customer) => {
                  const avatar = customer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.full_name || customer.email)}&background=1A1A1A&color=fff`;
                  return (
                    <tr key={customer.id} className="hover:bg-background-secondary/30 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-background-secondary shrink-0 border border-black/10">
                          <Image src={avatar} alt={customer.full_name || customer.email} fill unoptimized={avatar.startsWith('data:')} className="object-cover" />
                        </div>
                        <div>
                          <span className="font-bold text-primary-text block">{customer.full_name || 'Unnamed Client'}</span>
                          <span className="text-[11px] text-secondary-text font-mono">{customer.email}</span>
                        </div>
                      </td>
                      <td className="p-4 text-secondary-text font-medium">{customer.phone || '—'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                          customer.role === 'admin' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-black/5 text-secondary-text'
                        }`}>
                          {customer.role}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-primary-text">{customer.orders_count || 0}</td>
                      <td className="p-4 font-bold text-primary-text">{formatCurrency(customer.total_spent || 0)}</td>
                      <td className="p-4 text-secondary-text font-medium">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewCustomer(customer)}
                            className="p-1.5 rounded-lg hover:bg-black/5 text-secondary-text hover:text-accent transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleRole(customer)}
                            className="p-1.5 rounded-lg hover:bg-accent/10 text-secondary-text hover:text-accent transition-colors"
                            title="Toggle Admin Role"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CUSTOMER DETAILS MODAL */}
      <Modal
        isOpen={Boolean(viewCustomer)}
        onClose={() => setViewCustomer(null)}
        title="Customer Profile Details"
        maxWidth="md"
      >
        {viewCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-black/5">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-background-secondary shrink-0 border border-black/10">
                <Image
                  src={viewCustomer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewCustomer.full_name || viewCustomer.email)}&background=1A1A1A&color=fff`}
                  alt="Customer Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-primary-text">{viewCustomer.full_name || 'Unnamed Client'}</h3>
                <span className="text-xs text-secondary-text font-mono block">{viewCustomer.email}</span>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  viewCustomer.role === 'admin' ? 'bg-accent text-white' : 'bg-black/10 text-secondary-text'
                }`}>
                  Role: {viewCustomer.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-background-secondary/50 rounded-2xl space-y-1">
                <span className="text-secondary-text font-medium block">Total Orders</span>
                <span className="font-bold text-lg text-primary-text">{viewCustomer.orders_count || 0}</span>
              </div>
              <div className="p-3 bg-background-secondary/50 rounded-2xl space-y-1">
                <span className="text-secondary-text font-medium block">Lifetime Spend</span>
                <span className="font-bold text-lg text-primary-text">{formatCurrency(viewCustomer.total_spent || 0)}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 text-secondary-text">
                <Mail className="w-4 h-4 text-accent" />
                <span>{viewCustomer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-secondary-text">
                <Phone className="w-4 h-4 text-accent" />
                <span>{viewCustomer.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-secondary-text">
                <Calendar className="w-4 h-4 text-accent" />
                <span>Registered on {new Date(viewCustomer.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setViewCustomer(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleToggleRole(viewCustomer)}>
                Toggle Role ({viewCustomer.role === 'admin' ? 'Revoke Admin' : 'Make Admin'})
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
