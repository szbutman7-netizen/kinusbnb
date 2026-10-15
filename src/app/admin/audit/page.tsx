"use client";

import React, { useState, useMemo } from 'react';
import { 
  History, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  CheckSquare, 
  Square,
  Lock
} from 'lucide-react';
import { useKinusData } from '@/lib/hooks/useKinusData';
import { useAuth } from '@/lib/context/AuthContext';
import { AuditLogEntry } from '@/types';
import { MultiSelectDropdown } from '@/components/common/MultiSelectDropdown';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { formatDateTimeToHebrewCalendar } from '@/lib/utils/formatters';

const PAGE_SIZE = 50;

export default function AuditLogPage() {
  const { auditLogs, users, actions, isLoaded } = useKinusData();
  const { user: currentUser, hasAccess } = useAuth();

  const isEditor = currentUser?.role === 'SUPER_ADMIN' || hasAccess('audit', 'EDIT');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedPerformers, setSelectedPerformers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isProcessingUndo, setIsProcessingUndo] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);

  // Multi-select state
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Confirmation Modal state
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    log: AuditLogEntry | null;
  }>({
    isOpen: false,
    log: null
  });

  // Helper to get user display name
  const getUserDisplayName = (log: AuditLogEntry): string => {
    if (log.userDisplayName) return log.userDisplayName;
    if (log.userId) {
      const match = users.find(u => u.id === log.userId || u.email === log.userId);
      if (match) return match.displayName;
    }
    if (log.userEmail) {
      return log.userEmail;
    }
    return log.userId || 'משתמש מערכת';
  };

  // Unique actions list for filter
  const actionList = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach(l => {
      if (l.actionHebrew) set.add(l.actionHebrew);
      else if (l.action) set.add(l.action);
    });
    return Array.from(set).sort();
  }, [auditLogs]);

  // Unique performers list for filter
  const performerList = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach(l => {
      const name = getUserDisplayName(l);
      if (name && name.trim()) set.add(name.trim());
    });
    return Array.from(set).sort();
  }, [auditLogs, users]);

  // Filtered audit logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (selectedActions.length > 0) {
        const actionMatches = selectedActions.includes(log.actionHebrew || '') || selectedActions.includes(log.action || '');
        if (!actionMatches) return false;
      }

      if (selectedPerformers.length > 0) {
        const pName = getUserDisplayName(log);
        if (!selectedPerformers.includes(pName)) return false;
      }

      if (startDate) {
        const logDate = (log.timestamp || '').split('T')[0];
        if (logDate < startDate) return false;
      }

      if (endDate) {
        const logDate = (log.timestamp || '').split('T')[0];
        if (logDate > endDate) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesDesc = (log.description || '').toLowerCase().includes(q);
        const matchesEntity = (log.entity || '').toLowerCase().includes(q);
        const matchesEntityId = (log.entityId || '').toLowerCase().includes(q);
        const userDisplay = getUserDisplayName(log).toLowerCase();
        const matchesUser = userDisplay.includes(q) || (log.userEmail || log.userId || '').toLowerCase().includes(q);
        const matchesAction = (log.actionHebrew || log.action || '').toLowerCase().includes(q);
        if (!matchesDesc && !matchesEntity && !matchesEntityId && !matchesUser && !matchesAction) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, selectedActions, selectedPerformers, startDate, endDate, searchQuery, users]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);

  // Multi-select helpers
  const handleToggleSelectLog = (id: string) => {
    setSelectedLogIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectPage = () => {
    const pageIds = paginatedLogs.map(l => l.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedLogIds.includes(id));

    if (allPageSelected) {
      setSelectedLogIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedLogIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const isAllPageSelected = paginatedLogs.length > 0 && paginatedLogs.every(l => selectedLogIds.includes(l.id));

  const handleRequestUndo = (log: AuditLogEntry) => {
    if (!isEditor) {
      setFeedback({
        type: 'ERROR',
        message: 'מצב צפייה בלבד – אין הרשאה לבצע ביטול פעולות (Undo)'
      });
      return;
    }
    setConfirmModalData({
      isOpen: true,
      log
    });
  };

  const handleExecuteUndo = async () => {
    const log = confirmModalData.log;
    if (!log) return;

    setIsProcessingUndo(log.id);
    setFeedback(null);

    try {
      const res = await actions.undoAuditLog(log.id, currentUser?.id || 'admin');
      actions.refreshData();

      if (res.success) {
        setFeedback({
          type: 'SUCCESS',
          message: res.message || 'הפעולה בוטלה ושוחזרה בהצלחה'
        });
      } else {
        setFeedback({
          type: 'ERROR',
          message: res.error || 'לא ניתן לבטל פעולה זו'
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'ERROR',
        message: e?.message || 'שגיאה בביטול הפעולה'
      });
    } finally {
      setIsProcessingUndo(null);
      setConfirmModalData({ isOpen: false, log: null });
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE_SHLIACH':
      case 'CREATE_APARTMENT':
      case 'CREATE_USER':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'UPDATE_SHLIACH':
      case 'UPDATE_APARTMENT':
      case 'UPDATE_USER':
      case 'UPDATE_SETTINGS':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'DELETE_SHLIACH':
      case 'DELETE_APARTMENT':
      case 'DELETE_USER':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'ASSIGN_PLACEMENT':
      case 'BATCH_PUBLISH_PLACEMENT':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'UNASSIGN_PLACEMENT':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'TOGGLE_CHECKIN':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'TOGGLE_BLOCK':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'UNDO_ACTION':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (!isLoaded) {
    return <div className="p-8 text-center text-slate-500">טוען יומן שינויים...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Read-Only Banner */}
      {!isEditor && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>מצב צפייה בלבד – ביטול פעולות (Undo) ושחזור שינויים חסומים עבור רמת ההרשאה שלך</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl flex items-center justify-center shadow-xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              יומן שינויים ואבטחה (Audit Log)
            </h1>
            <p className="text-xs text-slate-500">
              תיעוד היסטורי מלא של כלל השינויים, השיבוצים והפעולות במערכת (מוצגות 50 פעולות בעמוד)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedLogIds.length > 0 && (
            <div className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-blue-700" />
              <span>נבחרו {selectedLogIds.length} רשומות</span>
              <button 
                onClick={() => setSelectedLogIds([])}
                className="mr-2 text-[11px] underline hover:text-blue-950 cursor-pointer"
              >
                נקה בחירה
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>סך פעולות מתועדות: {auditLogs.length}</span>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 border text-xs font-semibold rounded-xl flex items-center justify-between gap-3 ${
          feedback.type === 'SUCCESS'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-red-50 text-red-900 border-red-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer underline"
          >
            סגור
          </button>
        </div>
      )}

      {/* Search & Action Filters */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs space-y-3">
        {/* Top Row: Full-width Search */}
        <div className="relative w-full">
          <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="חיפוש מהיר ביומן (שם שליח, דירה, שם מבצע, תיאור שינוי, מזהה)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 font-medium h-[38px]"
          />
        </div>

        {/* Bottom Row: Aligned Filter Controls */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end text-xs">
          <div>
            <MultiSelectDropdown
              label="מבצע הפעולה"
              allLabel={`כל המבצעים (${performerList.length})`}
              options={performerList}
              selectedValues={selectedPerformers}
              onChange={(newVals) => {
                setSelectedPerformers(newVals);
                setCurrentPage(1);
              }}
              placeholder="חיפוש מבצע..."
            />
          </div>

          <div>
            <MultiSelectDropdown
              label="סוג פעולה"
              allLabel={`כל הפעולות (${actionList.length})`}
              options={actionList}
              selectedValues={selectedActions}
              onChange={(newVals) => {
                setSelectedActions(newVals);
                setCurrentPage(1);
              }}
              placeholder="חיפוש פעולה..."
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold text-xs mb-1">
              מתאריך:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 h-[36px]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold text-xs mb-1">
              עד תאריך:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 h-[36px]"
            />
          </div>

          <div>
            <button
              onClick={() => {
                setSelectedActions([]);
                setSelectedPerformers([]);
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-300 cursor-pointer h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span>איפוס סינונים</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button 
                    onClick={handleToggleSelectPage}
                    className="text-slate-600 hover:text-slate-900 p-0.5 cursor-pointer"
                    title={isAllPageSelected ? 'בטל בחירת עמוד' : 'בחר את כל העמוד'}
                  >
                    {isAllPageSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-700" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3">זמן הפעולה</th>
                <th className="py-3.5 px-3">סוג פעולה</th>
                <th className="py-3.5 px-3">תיאור הפעולה בעברית</th>
                <th className="py-3.5 px-3">יישות ומזהה</th>
                <th className="py-3.5 px-3">שם מבצע</th>
                <th className="py-3.5 px-3 text-center">ביטול פעולה (Undo)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 text-xs">
                    לא נמצאו רשומות ביומן התואמות את החיפוש והסינון הנבחר
                  </td>
                </tr>
              ) : (
                paginatedLogs.map(log => {
                  const isExpanded = expandedLogId === log.id;
                  const isUndone = Boolean(log.undone);
                  const canUndo = log.action !== 'UNDO_ACTION' && !isUndone;
                  const isBusy = isProcessingUndo === log.id;
                  const formattedTime = formatDateTimeToHebrewCalendar(log.timestamp);
                  const userDisplayName = getUserDisplayName(log);
                  const isSelected = selectedLogIds.includes(log.id);

                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`transition-colors ${isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'} ${isUndone ? 'opacity-65 bg-slate-50/50' : ''}`}>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleSelectLog(log.id)}
                            className="p-0.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-700" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium text-xs whitespace-nowrap">
                          <div className="font-semibold">{formattedTime}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString('he-IL')}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getActionBadgeColor(log.action)}`}>
                            {log.actionHebrew || log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900 max-w-md">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{log.description || `${log.entity} #${log.entityId}`}</span>
                            {(log.before || log.after) && (
                              <button
                                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                className="text-[10px] text-blue-700 hover:underline inline-flex items-center gap-0.5 shrink-0 cursor-pointer font-bold mr-1"
                              >
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                <span>{isExpanded ? 'הסתר שינוי' : 'הצג שינוי'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          <span className="font-sans font-semibold text-slate-700">{log.entity}</span> #{log.entityId}
                        </td>
                        <td className="py-3 px-3 text-slate-900 font-semibold whitespace-nowrap">
                          {userDisplayName}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isUndone ? (
                            <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-500 border border-slate-200 inline-flex items-center gap-1" title="פעולה זו כבר בוטלה ושוחזרה">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>בוטל ושוחזר</span>
                            </span>
                          ) : canUndo ? (
                            <button
                              onClick={() => handleRequestUndo(log)}
                              disabled={isBusy || !isEditor}
                              title="בטל פעולה זו ושחזר מצב קודם"
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                              <span>{isBusy ? 'מבטל...' : 'ביטול'}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-300">--</span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable State Snapshot Details */}
                      {isExpanded && (log.before || log.after) && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={7} className="p-4 border-t border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              {log.before && (
                                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
                                  <span className="font-bold text-slate-800 block text-[11px]">מצב לפני הפעולה (Before):</span>
                                  <pre className="text-[10px] font-mono text-slate-600 whitespace-pre-wrap overflow-x-auto max-h-40 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                    {JSON.stringify(log.before, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.after && (
                                <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
                                  <span className="font-bold text-slate-800 block text-[11px]">מצב לאחר הפעולה (After):</span>
                                  <pre className="text-[10px] font-mono text-slate-600 whitespace-pre-wrap overflow-x-auto max-h-40 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                    {JSON.stringify(log.after, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (50 items per page) */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            <span>
              מציג <strong>{filteredLogs.length > 0 ? startIndex + 1 : 0}</strong> - <strong>{Math.min(startIndex + PAGE_SIZE, filteredLogs.length)}</strong> מתוך <strong>{filteredLogs.length}</strong> רשומות
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={safeCurrentPage <= 1}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
              <span>הקודם</span>
            </button>

            <div className="px-3 py-1 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 shadow-2xs">
              עמוד {safeCurrentPage} מתוך {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <span>הבא</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Undo Action */}
      <ConfirmationModal
        isOpen={confirmModalData.isOpen}
        type="undo"
        title="אישור ביטול / שחזור פעולה (Undo)"
        message={`האם ברצונך לבטל את הפעולה:\n"${confirmModalData.log?.description || confirmModalData.log?.actionHebrew}"?`}
        itemDetails="המערכת תחזיר את הנתונים למצבם הקודם כפי שמתועד ברשומה זו, ותסמן פעולה זו כמשוחזרת."
        confirmText="בטל פעולה זו כעת"
        cancelText="אל תבטל"
        isSubmitting={Boolean(isProcessingUndo)}
        onConfirm={handleExecuteUndo}
        onCancel={() => setConfirmModalData({ isOpen: false, log: null })}
      />
    </div>
  );
}
