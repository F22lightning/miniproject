import { useState, useEffect } from 'react';
import { fetchCookingGuide } from '../api';
import { X, Clock, ChefHat, Loader2, Image as ImageIcon } from 'lucide-react';

export default function SopModal({ menuId, onClose }) {
    const [guide, setGuide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadGuide = async () => {
            try {
                setLoading(true);
                const data = await fetchCookingGuide(menuId);
                setGuide(data);
            } catch (err) {
                setError('ไม่พบสูตรอาหารสำหรับเมนูนี้');
            } finally {
                setLoading(false);
            }
        };
        if (menuId) {
            loadGuide();
        }
    }, [menuId]);

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 py-10" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <ChefHat className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">คู่มือการทำอาหาร (SOP)</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col flex-1 items-center justify-center py-10 text-emerald-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">กำลังโหลดสูตรอาหาร...</p>
                        </div>
                    ) : error || !guide ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ChefHat className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">{error || 'ไม่พบข้อมูล'}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">

                            <div className="flex flex-col md:flex-row gap-6">

                                {/* Left col: Image */}
                                <div className="w-full md:w-5/12 shrink-0">
                                    {guide.ลิงก์รูปภาพประกอบ ? (
                                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative group">
                                            <img
                                                src={guide.ลิงก์รูปภาพประกอบ}
                                                alt="รูปประกอบเมนู"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=Image+Not+Found';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="aspect-square rounded-xl bg-slate-50 border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400">
                                            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                            <span className="text-sm">ไม่มีรูปภาพประกอบ</span>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 w-full justify-center px-4 py-3 rounded-xl text-sm font-semibold border border-emerald-100">
                                        <Clock className="w-4 h-4" />
                                        เวลามาตรฐาน: {guide.เวลามาตรฐาน_นาที} นาที
                                    </div>
                                </div>

                                {/* Right col: Steps */}
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 mb-3 text-lg border-b border-slate-100 pb-2">ขั้นตอนการทำ:</h4>
                                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 h-full max-h-[300px] overflow-y-auto shadow-inner">
                                        <ol className="list-decimal pl-4 space-y-3 text-slate-700 font-medium leading-relaxed">
                                            {guide.วิธีการทำ_สูตร ? guide.วิธีการทำ_สูตร.split('\n').map((step, i) => {
                                                const cleanStep = step.replace(/^\d+\.\s*/, '');
                                                if (!cleanStep.trim()) return null;
                                                return <li key={i} className="pl-2 marker:text-emerald-500 marker:font-bold">{cleanStep}</li>
                                            }) : (
                                                <li className="text-slate-400 italic">ไม่ได้ระบุขั้นตอน</li>
                                            )}
                                        </ol>
                                    </div>
                                </div>

                            </div>

                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors shadow-sm"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    );
}
