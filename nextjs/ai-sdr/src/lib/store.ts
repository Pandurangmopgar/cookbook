// Simple in-memory store for demo purposes
// In production, use a database like Supabase, Postgres, etc.

import { Lead, Interaction, Task } from './types';
import { v4 as uuid } from 'uuid';

// Use global to persist across hot reloads in development
declare global {
  var __sdrStore: {
    leads: Map<string, Lead>;
    interactions: Map<string, Interaction[]>;
    tasks: Map<string, Task[]>;
    initialized: boolean;
  } | undefined;
}

// Initialize global store if not exists
if (!global.__sdrStore) {
  global.__sdrStore = {
    leads: new Map(),
    interactions: new Map(),
    tasks: new Map(),
    initialized: false,
  };
}

// In-memory storage (persists across hot reloads)
const leads = global.__sdrStore.leads;
const interactions = global.__sdrStore.interactions;
const tasks = global.__sdrStore.tasks;

// Initialize with sample data
const sampleLeads: Lead[] = [
  {
    id: uuid(),
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.io',
    company: 'TechCorp',
    title: 'VP of Engineering',
    phone: '+1-555-0101',
    linkedin: 'linkedin.com/in/sarahchen',
    industry: 'Technology',
    companySize: '500-1000',
    status: 'new',
    score: 0,
    tags: ['enterprise', 'tech'],
    createdAt: new Date().toISOString(),
  },
  {
    id: uuid(),
    name: 'Michael Rodriguez',
    email: 'mrodriguez@growthstartup.com',
    company: 'GrowthStartup',
    title: 'CTO',
    phone: '+1-555-0102',
    industry: 'SaaS',
    companySize: '50-200',
    status: 'contacted',
    score: 45,
    lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['startup', 'saas'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuid(),
    name: 'Emily Watson',
    email: 'ewatson@financeplus.com',
    company: 'FinancePlus',
    title: 'Director of Operations',
    industry: 'Finance',
    companySize: '1000-5000',
    status: 'engaged',
    score: 72,
    lastContactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextFollowUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['enterprise', 'finance'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Initialize sample data only once
if (!global.__sdrStore!.initialized) {
  sampleLeads.forEach((lead) => leads.set(lead.id, lead));
  global.__sdrStore!.initialized = true;
}

// Lead operations
export function getAllLeads(): Lead[] {
  return Array.from(leads.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLeadById(id: string): Lead | undefined {
  return leads.get(id);
}

export function createLead(data: Omit<Lead, 'id' | 'createdAt' | 'score'>): Lead {
  const lead: Lead = {
    ...data,
    id: uuid(),
    score: 0,
    createdAt: new Date().toISOString(),
  };
  leads.set(lead.id, lead);
  return lead;
}

export function updateLead(id: string, data: Partial<Lead>): Lead | undefined {
  const lead = leads.get(id);
  if (!lead) return undefined;
  
  const updated = { ...lead, ...data };
  leads.set(id, updated);
  return updated;
}

export function deleteLead(id: string): boolean {
  return leads.delete(id);
}

// Interaction operations
export function getLeadInteractions(leadId: string): Interaction[] {
  return interactions.get(leadId) || [];
}

export function addInteraction(
  leadId: string,
  data: Omit<Interaction, 'id' | 'leadId' | 'createdAt'>
): Interaction {
  const interaction: Interaction = {
    ...data,
    id: uuid(),
    leadId,
    createdAt: new Date().toISOString(),
  };
  
  const existing = interactions.get(leadId) || [];
  interactions.set(leadId, [...existing, interaction]);
  
  // Update lead's last contacted time
  const lead = leads.get(leadId);
  if (lead) {
    leads.set(leadId, {
      ...lead,
      lastContactedAt: interaction.createdAt,
      status: lead.status === 'new' ? 'contacted' : lead.status,
    });
  }
  
  return interaction;
}

// Task operations
export function getLeadTasks(leadId: string): Task[] {
  return tasks.get(leadId) || [];
}

export function getAllTasks(): Task[] {
  const allTasks: Task[] = [];
  tasks.forEach((taskList) => allTasks.push(...taskList));
  return allTasks.sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
  );
}

export function createTask(
  leadId: string,
  data: Omit<Task, 'id' | 'leadId' | 'completed'>
): Task {
  const task: Task = {
    ...data,
    id: uuid(),
    leadId,
    completed: false,
  };
  
  const existing = tasks.get(leadId) || [];
  tasks.set(leadId, [...existing, task]);
  
  return task;
}

export function completeTask(taskId: string): Task | undefined {
  for (const [leadId, taskList] of tasks.entries()) {
    const idx = taskList.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      taskList[idx].completed = true;
      tasks.set(leadId, taskList);
      return taskList[idx];
    }
  }
  return undefined;
}

// Stats
export function getStats() {
  const allLeads = getAllLeads();
  const allInteractions: Interaction[] = [];
  interactions.forEach((list) => allInteractions.push(...list));
  
  return {
    totalLeads: allLeads.length,
    leadsContacted: allLeads.filter((l) => l.status !== 'new').length,
    emailsSent: allInteractions.filter((i) => i.type === 'email' && i.direction === 'outbound').length,
    callsMade: allInteractions.filter((i) => i.type === 'call').length,
    meetingsBooked: allLeads.filter((l) => l.status === 'meeting_scheduled').length,
    responseRate: allLeads.length > 0 
      ? Math.round((allLeads.filter((l) => l.status !== 'new' && l.status !== 'contacted').length / allLeads.length) * 100)
      : 0,
  };
}
