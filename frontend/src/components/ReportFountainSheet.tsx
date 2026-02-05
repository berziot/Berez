"use client";

import { useState } from 'react';
import { API_URL } from '@/app/consts';
import { ReportType } from '@/app/types';
import { useAuth } from '@/contexts/AuthContext';

interface ReportFountainSheetProps {
    fountainId: number;
    isOpen: boolean;
    onClose: () => void;
}

const reportTypeLabels: Record<ReportType, string> = {
    broken: 'הברזיה מקולקלת',
    missing: 'הברזיה חסרה/הוסרה',
    incorrect_location: 'מיקום שגוי',
    other: 'אחר'
};

export default function ReportFountainSheet({ fountainId, isOpen, onClose }: ReportFountainSheetProps) {
    const { token } = useAuth();
    const [reportType, setReportType] = useState<ReportType>('broken');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/fountains/report`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    fountain_id: fountainId,
                    report_type: reportType,
                    description: description || null
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit report');
            }

            const data = await response.json();
            setSuccess(true);
            
            // Close after a delay to show success message
            setTimeout(() => {
                onClose();
                // Reset form
                setReportType('broken');
                setDescription('');
                setSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Error submitting report:', err);
            setError('שגיאה בשליחת הדיווח. נסה שוב.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
            <div 
                className="bg-white rounded-t-3xl w-full max-w-lg p-6 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-6">דיווח על בעיה</h2>

                {success ? (
                    <div className="py-8 text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-lg font-medium text-green-600">תודה על הדיווח!</p>
                        <p className="text-gray-600 mt-2">נבדוק את הבעיה בהקדם</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Report type selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                סוג הבעיה
                            </label>
                            <div className="space-y-2">
                                {(Object.keys(reportTypeLabels) as ReportType[]).map((type) => (
                                    <label
                                        key={type}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                                            reportType === type
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="reportType"
                                            value={type}
                                            checked={reportType === type}
                                            onChange={(e) => setReportType(e.target.value as ReportType)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="font-medium">{reportTypeLabels[type]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                פרטים נוספים (אופציונלי)
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="ספר לנו עוד על הבעיה..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none resize-none"
                                rows={4}
                                maxLength={500}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-left">
                                {description.length}/500
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                disabled={isSubmitting}
                            >
                                ביטול
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 px-4 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'שולח...' : 'שלח דיווח'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
