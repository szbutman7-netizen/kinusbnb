"use client";

import { useState, useEffect } from "react";
import { dataStore } from "@/lib/services/dataService";
import { 
  Shliach, 
  Apartment, 
  Bed, 
  UserProfile, 
  EmailTemplate, 
  EmailLog, 
  DashboardStats,
  FormSettings,
  ContactMessage,
  AuditLogEntry
} from "@/types";

export function useKinusData() {
  const [shluchim, setShluchim] = useState<Shliach[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [formSettings, setFormSettings] = useState<FormSettings>({ isOpen: true });
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshData = () => {
    setShluchim(dataStore.getShluchim());
    setApartments(dataStore.getApartments());
    setBeds(dataStore.getBeds());
    setUsers(dataStore.getUsers());
    setTemplates(dataStore.getTemplates());
    setEmailLogs(dataStore.getEmailLogs());
    setAuditLogs(dataStore.getAuditLogs());
    setFormSettings(dataStore.getFormSettings());
    setContactMessages(dataStore.getContactMessages());
    setStats(dataStore.getStats());
  };

  useEffect(() => {
    refreshData();
    setIsLoaded(true);

    const unsubscribe = dataStore.subscribe(() => {
      refreshData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isLoaded,
    shluchim,
    apartments,
    beds,
    users,
    templates,
    emailLogs,
    auditLogs,
    formSettings,
    contactMessages,
    stats,
    actions: {
      refreshData,
      logAudit: dataStore.logAudit.bind(dataStore),
      undoAuditLog: dataStore.undoAuditLog.bind(dataStore),
      addShliach: dataStore.addShliach.bind(dataStore),
      saveShliachDraft: dataStore.saveShliachDraft.bind(dataStore),
      updateShliach: dataStore.updateShliach.bind(dataStore),
      toggleBlockCheckIn: dataStore.toggleBlockCheckIn.bind(dataStore),
      checkInShliach: dataStore.checkInShliach.bind(dataStore),
      addApartmentWithBeds: dataStore.addApartmentWithBeds.bind(dataStore),
      updateApartment: dataStore.updateApartment.bind(dataStore),
      deleteApartment: dataStore.deleteApartment.bind(dataStore),
      assignPlacement: dataStore.assignPlacement.bind(dataStore),
      unassignPlacement: dataStore.unassignPlacement.bind(dataStore),
      setBedReserved: dataStore.setBedReserved.bind(dataStore),
      batchPublishPlacement: dataStore.batchPublishPlacement.bind(dataStore),
      addEmailLog: dataStore.addEmailLog.bind(dataStore),
      saveTemplate: dataStore.saveTemplate.bind(dataStore),
      addUser: dataStore.addUser.bind(dataStore),
      updateUser: dataStore.updateUser.bind(dataStore),
      deleteUser: dataStore.deleteUser.bind(dataStore),
      updateFormSettings: dataStore.updateFormSettings.bind(dataStore),
      deleteShliach: dataStore.deleteShliach.bind(dataStore),
      resetAllData: dataStore.resetAllData.bind(dataStore),
      addContactMessage: dataStore.addContactMessage.bind(dataStore),
      replyContactMessage: dataStore.replyContactMessage.bind(dataStore),
      deleteContactMessage: dataStore.deleteContactMessage.bind(dataStore),
    }
  };
}
