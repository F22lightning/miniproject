import { useState, useEffect } from 'react';
import { fetchOrders, updateOrderStatus } from '../api';
import OrderCard from './OrderCard';
import SopModal from './SopModal';
import { Loader2 } from 'lucide-react';

export default function OrderBoard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMenuId, setSelectedMenuId] = useState(null);

    const loadOrders = async () => {
        try {
            const data = await fetchOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
        // Auto refresh every 10 seconds
        const interval = setInterval(loadOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            // Optimistic update
            setOrders(prev =>
                prev.map(o => o.ID_ออเดอร์ === orderId ? { ...o, สถานะออเดอร์: newStatus } : o)
            );

            await updateOrderStatus(orderId, newStatus);
            if (newStatus === 'เสร็จสิ้น') {
                // Remove from board if finished
                setOrders(prev => prev.filter(o => o.ID_ออเดอร์ !== orderId));
            } else {
                // Reload to get exact timestamps from DB
                loadOrders();
            }
        } catch (error) {
            console.error('Failed to update status', error);
            loadOrders(); // Revert on failure
        }
    };

    if (loading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-full pt-20 text-emerald-600">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const waitingOrders = orders.filter(o => o.สถานะออเดอร์ === 'รอคิว');
    const doingOrders = orders.filter(o => o.สถานะออเดอร์ === 'กำลังทำ');

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full items-start">
            {/* Waiting Column */}
            <div className="flex-1 min-w-[320px] bg-slate-100 rounded-2xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
                        รอคิว (Waiting)
                    </h2>
                    <span className="bg-white text-slate-600 px-3 py-1 rounded-full text-sm font-semibold shadow-sm border border-slate-200">
                        {waitingOrders.length}
                    </span>
                </div>

                <div className="flex flex-col gap-4">
                    {waitingOrders.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">ไม่มีออเดอร์รอคิว</div>
                    ) : (
                        waitingOrders.map(order => (
                            <OrderCard
                                key={order.ID_ออเดอร์}
                                order={order}
                                onStatusChange={handleStatusChange}
                                onViewSop={setSelectedMenuId}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Doing Column */}
            <div className="flex-1 min-w-[320px] bg-emerald-50 rounded-2xl p-4 shadow-sm border border-emerald-100">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        กำลังทำ (In Progress)
                    </h2>
                    <span className="bg-white text-emerald-600 px-3 py-1 rounded-full text-sm font-semibold shadow-sm border border-emerald-100">
                        {doingOrders.length}
                    </span>
                </div>

                <div className="flex flex-col gap-4">
                    {doingOrders.length === 0 ? (
                        <div className="text-center py-10 text-emerald-400/70 text-sm">ยังไม่มีออเดอร์ที่กำลังทำ</div>
                    ) : (
                        doingOrders.map(order => (
                            <OrderCard
                                key={order.ID_ออเดอร์}
                                order={order}
                                onStatusChange={handleStatusChange}
                                onViewSop={setSelectedMenuId}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* SOP Modal overlay */}
            {selectedMenuId && (
                <SopModal
                    menuId={selectedMenuId}
                    onClose={() => setSelectedMenuId(null)}
                />
            )}
        </div>
    );
}
