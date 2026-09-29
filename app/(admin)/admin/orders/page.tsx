"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Search, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Order, FulfillmentStatus } from '@/types';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('FedEx');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });
      if (data) setOrders(data as Order[]);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: FulfillmentStatus) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          fulfillment_status: status,
          tracking_number: trackingNumber || undefined,
          tracking_carrier: trackingCarrier || undefined,
        })
        .eq('id', orderId);

      if (error) {
        toast('Failed to update order status', 'error');
      } else {
        toast(`Order status updated to "${status}"`, 'success');
        if (selectedOrder) {
          setSelectedOrder({ ...selectedOrder, fulfillment_status: status });
        }
        fetchOrders();
      }
    } catch {
      toast('Status update failed', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary-text">Order Management</h1>
        <p className="text-xs text-secondary-text mt-1">Monitor, process, and update fulfillment tracking for client orders.</p>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white px-4 py-3 rounded-2xl border border-black/5 shadow-card max-w-md">
        <Search className="w-4 h-4 text-secondary-text mr-3 shrink-0" />
        <input
          type="text"
          placeholder="Search by order # or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs font-medium bg-transparent outline-none"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-card overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-secondary-text animate-pulse">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ShoppingCart className="w-12 h-12 text-secondary-text mx-auto" />
            <h3 className="font-serif text-xl font-bold text-primary-text">No Orders Found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/10 bg-background-secondary/50 text-secondary-text uppercase font-bold tracking-wider">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4 text-right">View Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background-secondary/30 transition-colors">
                    <td className="p-4 font-bold text-primary-text">#{order.order_number}</td>
                    <td className="p-4 text-secondary-text">{formatDate(order.created_at)}</td>
                    <td className="p-4 text-primary-text font-medium">{order.email}</td>
                    <td className="p-4 font-bold text-primary-text">{formatCurrency(order.total)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                        order.payment_status === 'paid' ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.fulfillment_status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as FulfillmentStatus)}
                        className="px-2.5 py-1 bg-background-secondary border border-black/10 rounded-lg text-xs font-semibold text-primary-text outline-none cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackingNumber(order.tracking_number || '');
                        }}
                        className="p-1.5 rounded-lg hover:bg-black/5 text-secondary-text hover:text-accent transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order #${selectedOrder.order_number}` : ''}
        maxWidth="xl"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 bg-background-secondary rounded-2xl">
              <div>
                <span className="font-bold uppercase tracking-wider text-secondary-text">Customer Email</span>
                <p className="font-semibold text-primary-text mt-0.5">{selectedOrder.email}</p>
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-secondary-text">Payment Reference</span>
                <p className="font-semibold text-primary-text mt-0.5">{selectedOrder.razorpay_payment_id || 'Razorpay Completed'}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <h4 className="font-bold uppercase tracking-wider text-primary-text">Order Items</h4>
              <div className="divide-y divide-black/5 border border-black/5 rounded-xl p-3 bg-white">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between items-center">
                    <span className="font-medium text-primary-text">{item.title} (x{item.quantity})</span>
                    <span className="font-bold text-primary-text">{formatCurrency(item.line_total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Input */}
            <div className="space-y-2 pt-2 border-t border-black/5">
              <h4 className="font-bold uppercase tracking-wider text-primary-text">Fulfillment Tracking</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter tracking number..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 px-3 py-2 border border-black/15 rounded-xl outline-none focus:border-accent"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.fulfillment_status)}
                >
                  Save Tracking
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
