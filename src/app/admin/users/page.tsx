"use client";

import { useState } from "react";
import { useKinusData } from "@/lib/hooks/useKinusData";
import { useAuth } from "@/lib/context/AuthContext";
import { UserProfile, UserRole, ScreenAccessLevel } from "@/types";
import { 
  UserCheck, 
  Plus, 
  Shield, 
  Mail, 
  Trash2, 
  Edit2, 
  AlertCircle, 
  Check, 
  X,
  Lock
} from "lucide-react";

export default function UsersManagementPage() {
  const { users, actions, isLoaded } = useKinusData();
  const { user: currentUser } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form State
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<UserRole>("RECEPTION_STAFF");

  if (!isLoaded) {
    return <div className="p-8 text-center text-slate-500">טוען משתמשי ניהול...</div>;
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !emailInput) return;

    // Default permissions based on role
    const isSuper = roleInput === "SUPER_ADMIN";
    const isHousing = roleInput === "HOUSING_MANAGER";
    const isReception = roleInput === "RECEPTION_STAFF";

    const newUser: UserProfile = {
      id: "user-" + Date.now(),
      displayName: nameInput.trim(),
      email: emailInput.trim().toLowerCase(),
      role: roleInput,
      isActive: true,
      createdAt: new Date().toISOString(),
      screenAccess: {
        shluchim: isSuper || isHousing ? "EDIT" : isReception ? "VIEW" : "VIEW",
        apartments: isSuper || isHousing ? "EDIT" : "VIEW",
        placement: isSuper || isHousing ? "EDIT" : "NONE",
        reception: isSuper || isReception ? "EDIT" : "VIEW",
        emails: isSuper ? "EDIT" : "NONE",
        users: isSuper ? "EDIT" : "NONE",
        audit: isSuper ? "EDIT" : isHousing ? "VIEW" : "NONE",
      },
    };

    actions.addUser(newUser);
    setNameInput("");
    setEmailInput("");
    setShowAddModal(false);
  };

  const handleDeleteUser = (user: UserProfile) => {
    if (user.id === currentUser?.id || user.email === currentUser?.email) {
      alert("הגנת נעילה עצמית (Self-Lockout): אינך יכול למחוק את חשבונך המחובר!");
      return;
    }
    if (confirm(`האם להסיר את הרשאות הגישה של ${user.displayName}?`)) {
      actions.deleteUser(user.id);
    }
  };

  const handleToggleActive = (user: UserProfile) => {
    if (user.id === currentUser?.id || user.email === currentUser?.email) {
      alert("הגנת נעילה עצמית: אינך יכול לחסום את חשבונך המחובר!");
      return;
    }
    actions.updateUser(user.id, { isActive: !user.isActive });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-blue-900" />
            ניהול משתמשי מערכת והרשאות (Whitelist)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            הגדרת צוות העובדים והדיילים המורשים להיכנס באמצעות Google Sign-In והגדרת הרשאות פרטניות
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          הוסף משתמש מורשה
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="p-3.5">שם ודוא״ל Google מורשה</th>
                <th className="p-3.5">תפקיד ראשי</th>
                <th className="p-3.5">הרשאות מסכים</th>
                <th className="p-3.5">סטטוס</th>
                <th className="p-3.5 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = u.id === currentUser?.id || u.email === currentUser?.email;

                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{u.displayName}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                            אתה מחובר
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {u.email}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === "SUPER_ADMIN"
                          ? "bg-purple-100 text-purple-800"
                          : u.role === "HOUSING_MANAGER"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-3.5 text-[10px] text-slate-600">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border">
                          נרשמים: {u.screenAccess.shluchim}
                        </span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border">
                          דירות: {u.screenAccess.apartments}
                        </span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border">
                          שיבוץ: {u.screenAccess.placement}
                        </span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border">
                          קבלה: {u.screenAccess.reception}
                        </span>
                        {u.screenAccess.audit && (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border">
                            יומן שינויים: {u.screenAccess.audit}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={isCurrent}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-opacity ${
                          u.isActive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        } ${isCurrent ? "opacity-60 cursor-not-allowed" : "hover:opacity-80"}`}
                      >
                        {u.isActive ? "פעיל ומורשה" : "מושבת / חסום"}
                      </button>
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={isCurrent}
                        className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
                          isCurrent
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:text-red-600 hover:bg-red-50"
                        }`}
                        title={isCurrent ? "לא ניתן למחוק את החשבון המחובר" : "מחק משתמש"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                הוספת משתמש Google מורשה
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  שם מלא / תצוגה *
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  required
                  placeholder="יוסי גרינוולד"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  כתובת Gmail / Google Workspace מורשית *
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  placeholder="yossi@gmail.com / yossi@kinus.org"
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  רק משתמש שיתחבר עם כתובת זו יוכל להיכנס לממשק.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  תפקיד במערכת
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as any)}
                  className="w-full p-2.5 border rounded-xl bg-white"
                >
                  <option value="RECEPTION_STAFF">דייל עמדת קבלה (Reception Desk)</option>
                  <option value="HOUSING_MANAGER">מנהל שיבוץ ודירות (Housing Manager)</option>
                  <option value="ADMIN">מנהל מערכת (Admin)</option>
                  <option value="SUPER_ADMIN">מנהל על (Super Admin)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border rounded-xl hover:bg-slate-50"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800"
                >
                  הוסף משתמש
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
