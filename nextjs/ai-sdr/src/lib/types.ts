export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  phone?: string;
  linkedin?: string;
  industry?: string;
  companySize?: string;
  status: 'new' | 'contacted' | 'engaged' | 'qualified' | 'meeting_scheduled' | 'closed_won' | 'closed_lost';
  score: number;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
}

export interface Interaction {
  id: string;
  leadId: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'linkedin';
  direction: 'outbound' | 'inbound';
  subject?: string;
  content: string;
  outcome?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  createdAt: string;
}

export interface Task {
  id: string;
  leadId: string;
  type: 'email' | 'call' | 'linkedin' | 'meeting' | 'other';
  title: string;
  description?: string;
  dueAt: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface Sequence {
  id: string;
  name: string;
  steps: SequenceStep[];
  active: boolean;
}

export interface SequenceStep {
  day: number;
  type: 'email' | 'call' | 'linkedin';
  template?: string;
  subject?: string;
}

export interface DashboardStats {
  totalLeads: number;
  leadsContacted: number;
  emailsSent: number;
  callsMade: number;
  meetingsBooked: number;
  responseRate: number;
}
