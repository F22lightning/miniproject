import { differenceInMinutes } from 'date-fns';
import { FileText, Play, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function OrderCard({ order, onStatusChange, onViewSop }) {
    const { ID_ออเดอร์, คิวที่, สถานะออเดอร์, วันที่เวลา_สั่ง, เวลาที่เริ่มทำ, items } = order;
    const [elapsedWait, setElapsedWait] = useState(0);

    // Update wait time every minute
    useEffect(() => {
        const calcTime = () => {
            const baseTime = เวลาที่เริ่มทำ ? new Date(เวลาที่เริ่มทำ) : new Date(วันที่เวลา_สั่ง);
            setElapsedWait(differenceInMinutes(new Date(), baseTime));
        };
        calcTime();
        const timer = setInterval(calcTime, 60000);
        return () => clearInterval(timer);
    }, [วันที่เวลา_สั่ง, เวลาที่เริ่มทำ]);

    const isDoing = สถานะออเดอร์ === 'กำลังทำ';

    // Style based on status and time
    const cardBorder = isDoing
        ? "border-emerald-200 shadow-emerald-100/50"
        : elapsedWait > 15
            ? "border-red-200 shadow-red-100/50"
            : "border-slate-200 shadow-slate-100/50";

    const headerBg = isDoing ? "bg-emerald-500 text-white" : "bg-white text-slate-800 border-b border-slate-100";

    return (
        <div className={`bg-white rounded-xl shadow-md border ${cardBorder} overflow-hidden transition-all hover:shadow-lg`}>
            {/* Header */}
            <div className={`${headerBg} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black">คิวที่ {คิวที่}</span>
                </div>
                <div className={`text-sm font-semibold flex items-center gap-1 ${isDoing ? 'text-emerald-50' : elapsedWait > 15 ? 'text-red-500' : 'text-slate-500'}`}>
                    <ClockIcon className="w-4 h-4" />
                    {elapsedWait} นาที
                </div>
            </div>

            {/* Item List */}
            <div className="p-4 flex flex-col gap-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1 border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 flex-1">
                                <span className="font-bold text-slate-700 w-5 text-right">{item.จำนวน}x</span>
                                <span className="font-medium text-slate-800">{item.ชื่อเมนู}</span>
                            </div>
                            <button
                                onClick={() => onViewSop(item.ID_เมนู)}
                                className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors shrink-0 tooltip"
                                title="ดูสูตรอาหาร (SOP)"
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                        </div>
                        {item.หมายเหตุ_คำสั่งพิเศษ && (
                            <div className="pl-7 text-xs font-medium text-amber-600 bg-amber-50 py-1 px-2 rounded-md inline-block w-fit">
                                * {item.หมายเหตุ_คำสั่งพิเศษ}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                {!isDoing ? (
                    <button
                        onClick={() => onStatusChange(ID_ออเดอร์, 'กำลังทำ')}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <Play className="w-4 h-4 fill-white" />
                        เริ่มทำ
                    </button>
                ) : (
                    <button
                        onClick={() => onStatusChange(ID_ออเดอร์, 'เสร็จสิ้น')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        เสร็จสิ้น (พร้อมเสิร์ฟ)
                    </button>
                )}
            </div>
        </div>
    );
}

function ClockIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
