'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  LayoutDashboard, MessageSquare, Phone, Users, BookOpen, Settings,
  Search, Plus, Clock, CheckCircle, AlertCircle, User, Mail, PhoneCall,
  Brain, Sparkles, ChevronRight, MoreHorizontal, Send, Paperclip,
  Mic, MicOff, PhoneOff, Volume2, Loader2
} from 'lucide-react';

// Types
interface Ticket {
  id: string;
  customer: { name: string; email: string; phone?: string };
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  channel: 'email' | 'chat' | 'phone';
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

interface Memory {
  id: string;
  content: string;
  created_at: string;
  memory_type?: string;
}

interface Message {
  id: string;
  role: 'customer' | 'agent' | 'ai';
  content: string;
  timestamp: string;
}

interface TranscriptEntry {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface LiveCall {
  id: string;
  customerId: string;
  customerPhone: string;
  direction: 'inbound' | 'outbound';
  status: 'ringing' | 'in-progress' | 'ended';
  startTime: string;
  transcript: TranscriptEntry[];
}

// Mock data
const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    customer: { name: 'Pandurang Mopgar', email: 'pandurangmopgar7410@gmail.com', phone: '+917410104980' },
    subject: 'Unable to access my account',
    status: 'open',
    priority: 'high',
    channel: 'email',
    lastMessage: 'I\'ve been trying to login but keep getting an error...',
    createdAt: '2024-12-09T10:30:00Z',
    updatedAt: '2024-12-09T14:20:00Z'
  },
  {
    id: 'TKT-002',
    customer: { name: 'Mike Chen', email: 'mike@example.com', phone: '+1 555-0456' },
    subject: 'Billing question about subscription',
    status: 'pending',
    priority: 'medium',
    channel: 'chat',
    lastMessage: 'Can you explain the charges on my last invoice?',
    createdAt: '2024-12-09T09:15:00Z',
    updatedAt: '2024-12-09T13:45:00Z'
  },
  {
    id: 'TKT-003',
    customer: { name: 'Emily Davis', email: 'emily@example.com' },
    subject: 'Feature request: Dark mode',
    status: 'resolved',
    priority: 'low',
    channel: 'email',
    lastMessage: 'Thank you for considering my suggestion!',
    createdAt: '2024-12-08T16:00:00Z',
    updatedAt: '2024-12-09T11:00:00Z'
  },
  {
    id: 'TKT-004',
    customer: { name: 'James Wilson', email: 'james@example.com', phone: '+1 555-0789' },
    subject: 'Integration not working',
    status: 'open',
    priority: 'high',
    channel: 'phone',
    lastMessage: 'The API keeps returning 500 errors',
    createdAt: '2024-12-09T11:00:00Z',
    updatedAt: '2024-12-09T15:00:00Z'
  }
];

const mockMessages: Message[] = [
  { id: '1', role: 'customer', content: 'Hi, I\'ve been trying to login to my account but keep getting an error message saying "Invalid credentials"', timestamp: '2024-12-09T10:30:00Z' },
  { id: '2', role: 'agent', content: 'Hello Sarah! I\'m sorry to hear you\'re having trouble logging in. Let me help you with that. Can you confirm the email address you\'re using to login?', timestamp: '2024-12-09T10:32:00Z' },
  { id: '3', role: 'customer', content: 'Yes, it\'s sarah@example.com - the same one I\'ve always used', timestamp: '2024-12-09T10:33:00Z' },
  { id: '4', role: 'ai', content: '💡 AI Suggestion: Based on customer history, Sarah reset her password 2 weeks ago. She may have forgotten the new password. Suggest password reset.', timestamp: '2024-12-09T10:33:30Z' },
];

// NavItem Component
function NavItem({ 
  icon, 
  active, 
  onClick, 
  tooltip, 
  badge 
}: { 
  icon: React.ReactNode; 
  active: boolean; 
  onClick: () => void; 
  tooltip: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
        active 
          ? 'bg-emerald-500/20 text-emerald-400' 
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
      }`}
      title={tooltip}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-medium">
          {badge}
        </span>
      )}
    </button>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: 'open' | 'pending' | 'resolved' }) {
  const styles = {
    open: 'bg-red-500/20 text-red-400 border-red-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    resolved: 'bg-green-500/20 text-green-400 border-green-500/30'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${styles[status]}`}>
      {status}
    </span>
  );
}

// Priority Badge Component
function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' }) {
  const styles = {
    low: 'text-zinc-400',
    medium: 'text-yellow-400',
    high: 'text-red-400'
  };
  return (
    <span className={`text-xs ${styles[priority]}`}>
      {priority === 'high' && <AlertCircle className="w-3 h-3 inline mr-1" />}
      {priority}
    </span>
  );
}

// Channel Icon Component
function ChannelIcon({ channel }: { channel: 'email' | 'chat' | 'phone' }) {
  const icons = {
    email: <Mail className="w-3.5 h-3.5" />,
    chat: <MessageSquare className="w-3.5 h-3.5" />,
    phone: <PhoneCall className="w-3.5 h-3.5" />
  };
  return <span className="text-zinc-500">{icons[channel]}</span>;
}

export default function SupportDashboard() {
  const [activeNav, setActiveNav] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(mockTickets[0]);
  const [customerMemories, setCustomerMemories] = useState<Memory[]>([]);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnCall, setIsOnCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<TranscriptEntry[]>([]);
  const [callStatus, setCallStatus] = useState<string>('');
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [showCustomCallModal, setShowCustomCallModal] = useState(false);
  const [customPhoneNumber, setCustomPhoneNumber] = useState('');
  const [customCallerName, setCustomCallerName] = useState('');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Fetch customer memories when ticket is selected
  useEffect(() => {
    if (selectedTicket) {
      fetchCustomerMemories(selectedTicket.customer.email);
    }
  }, [selectedTicket]);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOnCall) {
      interval = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOnCall]);

  // Poll for live transcript updates
  const pollCallStatus = useCallback(async () => {
    if (!activeCallId) return;
    
    try {
      const res = await fetch(`/api/calls/active?callId=${activeCallId}`);
      const data = await res.json();
      
      if (data.call) {
        setLiveTranscript(data.call.transcript || []);
        setCallStatus(data.call.status);
        
        if (data.call.status === 'ended') {
          setIsOnCall(false);
          setActiveCallId(null);
          setCallStatus('Call ended');
        }
      } else if (data.status === 'not_found' && isOnCall) {
        // Call might have ended
        setCallStatus('Call ended');
      }
    } catch (error) {
      console.error('Error polling call status:', error);
    }
  }, [activeCallId, isOnCall]);

  // Poll every 1 second when on call
  useEffect(() => {
    if (!isOnCall || !activeCallId) return;
    
    const interval = setInterval(pollCallStatus, 1000);
    return () => clearInterval(interval);
  }, [isOnCall, activeCallId, pollCallStatus]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveTranscript]);

  const fetchCustomerMemories = async (customerId: string) => {
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(customerId)}/memories`);
      const data = await res.json();
      setCustomerMemories(data.memories || []);
    } catch {
      setCustomerMemories([
        { id: '1', content: 'Customer prefers email communication', created_at: '2024-12-01T10:00:00Z', memory_type: 'preference' },
        { id: '2', content: 'Had billing issue resolved in November - was very satisfied', created_at: '2024-11-15T14:00:00Z', memory_type: 'interaction' },
        { id: '3', content: 'Premium plan subscriber since March 2024', created_at: '2024-03-10T09:00:00Z', memory_type: 'fact' },
        { id: '4', content: 'Reset password 2 weeks ago after forgetting credentials', created_at: '2024-11-25T09:00:00Z', memory_type: 'fact' },
      ]);
    }
  };

  const startCall = async (customNumber?: string, customName?: string) => {
    const phoneNumber = customNumber || selectedTicket?.customer.phone;
    const callerName = customName || selectedTicket?.customer.name || 'Unknown';
    
    if (!phoneNumber) return;
    setIsStartingCall(true);
    setCallStatus('Initiating call...');
    setShowCustomCallModal(false);
    
    try {
      const res = await fetch('/api/vapi/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: phoneNumber,
          customerName: callerName,
          customerEmail: customNumber ? '' : (selectedTicket?.customer.email || ''),
          ticketId: customNumber ? 'CUSTOM-CALL' : (selectedTicket?.id || ''),
          ticketSubject: customNumber ? 'Custom outbound call' : (selectedTicket?.subject || ''),
        })
      });
      
      const data = await res.json();
      
      if (data.success && data.callId) {
        setActiveCallId(data.callId);
        setIsOnCall(true);
        setCallDuration(0);
        setLiveTranscript([]);
        setCallStatus('Ringing...');
      } else {
        setCallStatus('Failed to start call');
        console.error('Call failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('Failed to start call');
    } finally {
      setIsStartingCall(false);
      setCustomPhoneNumber('');
      setCustomCallerName('');
    }
  };

  const handleCustomCall = () => {
    if (customPhoneNumber.trim()) {
      startCall(customPhoneNumber.trim(), customCallerName.trim() || 'Custom Call');
    }
  };

  const endCall = async () => {
    if (activeCallId) {
      try {
        await fetch(`/api/vapi/call?callId=${activeCallId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
    setIsOnCall(false);
    setActiveCallId(null);
    setCallDuration(0);
    setCallStatus('');
    setLiveTranscript([]);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const stats = {
    open: mockTickets.filter(t => t.status === 'open').length,
    pending: mockTickets.filter(t => t.status === 'pending').length,
    resolved: mockTickets.filter(t => t.status === 'resolved').length,
    avgResponse: '2.4h'
  };

  const filteredTickets = mockTickets.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-[#0f0f10] text-white overflow-hidden">
      {/* Custom Call Modal */}
      {showCustomCallModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#1a1a1b] border border-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <PhoneCall className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Make Custom Call</h3>
                <p className="text-sm text-zinc-400">Enter any phone number to call</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={customPhoneNumber}
                  onChange={(e) => setCustomPhoneNumber(e.target.value)}
                  placeholder="+1 555-123-4567"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none"
                  autoFocus
                />
                <p className="text-xs text-zinc-500 mt-1">Include country code (e.g., +1 for US, +91 for India)</p>
              </div>
              
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Caller Name (optional)</label>
                <input
                  type="text"
                  value={customCallerName}
                  onChange={(e) => setCustomCallerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCustomCallModal(false);
                  setCustomPhoneNumber('');
                  setCustomCallerName('');
                }}
                className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomCall}
                disabled={!customPhoneNumber.trim() || isStartingCall}
                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isStartingCall ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calling...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    Start Call
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-16 bg-[#0a0a0b] border-r border-zinc-800 flex flex-col items-center py-4 shrink-0">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-8">
          <Brain className="w-5 h-5 text-white" />
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} active={activeNav === 'dashboard'} onClick={() => setActiveNav('dashboard')} tooltip="Dashboard" />
          <NavItem icon={<MessageSquare className="w-5 h-5" />} active={activeNav === 'tickets'} onClick={() => setActiveNav('tickets')} tooltip="Tickets" badge={stats.open} />
          <NavItem icon={<Phone className="w-5 h-5" />} active={activeNav === 'calls'} onClick={() => setActiveNav('calls')} tooltip="Calls" />
          <NavItem icon={<Users className="w-5 h-5" />} active={activeNav === 'customers'} onClick={() => setActiveNav('customers')} tooltip="Customers" />
          <NavItem icon={<BookOpen className="w-5 h-5" />} active={activeNav === 'kb'} onClick={() => setActiveNav('kb')} tooltip="Knowledge Base" />
          
          {/* Custom Call Button */}
          <button
            onClick={() => setShowCustomCallModal(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
            title="Make Custom Call"
          >
            <PhoneCall className="w-5 h-5" />
          </button>
        </nav>
        
        <NavItem icon={<Settings className="w-5 h-5" />} active={activeNav === 'settings'} onClick={() => setActiveNav('settings')} tooltip="Settings" />
      </aside>


      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Ticket List Panel */}
        <div className="w-80 border-r border-zinc-800 flex flex-col bg-[#0a0a0b] shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tickets</h2>
              <button className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-1 p-2 border-b border-zinc-800 text-xs">
            <button className="flex-1 py-1.5 px-2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
              Open ({stats.open})
            </button>
            <button className="flex-1 py-1.5 px-2 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              Pending ({stats.pending})
            </button>
            <button className="flex-1 py-1.5 px-2 rounded bg-green-500/10 text-green-400 border border-green-500/20">
              Resolved ({stats.resolved})
            </button>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b border-zinc-800/50 cursor-pointer transition-colors ${
                  selectedTicket?.id === ticket.id 
                    ? 'bg-emerald-500/10 border-l-2 border-l-emerald-500' 
                    : 'hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ChannelIcon channel={ticket.channel} />
                    <span className="text-sm font-medium truncate max-w-[150px]">{ticket.customer.name}</span>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="text-sm text-zinc-300 mb-2 line-clamp-1">{ticket.subject}</p>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-4 border-b border-zinc-800 bg-[#0a0a0b]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{selectedTicket.subject}</h3>
                      <StatusBadge status={selectedTicket.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span>{selectedTicket.id}</span>
                      <span>•</span>
                      <span>{selectedTicket.customer.name}</span>
                      <span>•</span>
                      <span>{selectedTicket.customer.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTicket.customer.phone && (
                      <button
                        onClick={isOnCall ? endCall : () => startCall()}
                        disabled={isStartingCall}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                          isOnCall 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                      >
                        {isStartingCall ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : isOnCall ? (
                          <>
                            <PhoneOff className="w-4 h-4" />
                            End Call ({formatDuration(callDuration)})
                          </>
                        ) : (
                          <>
                            <Phone className="w-4 h-4" />
                            Call Customer
                          </>
                        )}
                      </button>
                    )}
                    <button className="p-2 hover:bg-zinc-800 rounded-lg">
                      <MoreHorizontal className="w-5 h-5 text-zinc-400" />
                    </button>
                  </div>
                </div>

                {/* Active Call Banner */}
                {(isOnCall || callStatus) && (
                  <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isOnCall ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
                      <span className="text-emerald-400 text-sm font-medium">
                        {callStatus === 'in-progress' 
                          ? `Call in progress with ${selectedTicket.customer.name}`
                          : callStatus === 'ringing' || callStatus === 'Ringing...'
                          ? `Calling ${selectedTicket.customer.name}...`
                          : callStatus || `Call with ${selectedTicket.customer.name}`
                        }
                      </span>
                      {isOnCall && <span className="text-emerald-400/70 text-sm">{formatDuration(callDuration)}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2 rounded-lg ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                      <button className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages / Live Transcript */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Show live transcript when on call */}
                {isOnCall && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">Live Call Transcript</span>
                      <div className="flex-1" />
                      <span className="text-xs text-zinc-500">{liveTranscript.length} messages</span>
                    </div>
                    
                    {liveTranscript.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-sm">Waiting for conversation...</span>
                        </div>
                        <p className="text-xs">Transcript will appear here in real-time</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {liveTranscript.map((entry, index) => (
                          <div
                            key={index}
                            className={`flex gap-3 ${entry.role === 'user' ? 'justify-end' : ''}`}
                          >
                            {entry.role === 'assistant' && (
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <Brain className="w-4 h-4 text-emerald-400" />
                              </div>
                            )}
                            <div className="max-w-[70%]">
                              <div className={`rounded-2xl px-4 py-2.5 ${
                                entry.role === 'user'
                                  ? 'bg-zinc-800 text-zinc-100'
                                  : 'bg-emerald-500/20 text-emerald-100'
                              }`}>
                                <p className="text-sm">{entry.text}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-zinc-600">
                                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                {entry.sentiment && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    entry.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                                    entry.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                                    'bg-zinc-700 text-zinc-400'
                                  }`}>
                                    {entry.sentiment}
                                  </span>
                                )}
                              </div>
                            </div>
                            {entry.role === 'user' && (
                              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-zinc-300" />
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={transcriptEndRef} />
                      </div>
                    )}
                  </div>
                )}

                {/* Show regular messages when not on call */}
                {!isOnCall && mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'customer' ? 'justify-end' : ''}`}
                  >
                    {message.role !== 'customer' && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        message.role === 'ai' ? 'bg-purple-500/20' : 'bg-emerald-500/20'
                      }`}>
                        {message.role === 'ai' ? (
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        ) : (
                          <User className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${message.role === 'ai' ? 'w-full max-w-none' : ''}`}>
                      {message.role === 'ai' ? (
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-purple-400 font-medium">MemoryStack AI Suggestion</span>
                          </div>
                          <p className="text-sm text-purple-200">{message.content.replace('💡 AI Suggestion: ', '')}</p>
                        </div>
                      ) : (
                        <div className={`rounded-2xl px-4 py-2.5 ${
                          message.role === 'customer'
                            ? 'bg-zinc-800 text-zinc-100'
                            : 'bg-emerald-500/20 text-emerald-100'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      )}
                      <span className="text-xs text-zinc-600 mt-1 block">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {message.role === 'customer' && (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-zinc-300" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-zinc-800 bg-[#0a0a0b]">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 resize-none"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300">
                        <Paperclip className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center gap-2 text-sm font-medium self-end transition-colors">
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              Select a ticket to view conversation
            </div>
          )}
        </div>

        {/* Customer Context Panel - MemoryStack Integration */}
        <div className="w-80 border-l border-zinc-800 bg-[#0a0a0b] flex flex-col shrink-0">
          {selectedTicket ? (
            <>
              {/* Customer Profile */}
              <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-lg font-semibold">
                    {selectedTicket.customer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedTicket.customer.name}</h3>
                    <p className="text-sm text-zinc-400">{selectedTicket.customer.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-zinc-900 rounded-lg p-3">
                    <p className="text-zinc-500 text-xs mb-1">Total Tickets</p>
                    <p className="font-semibold">12</p>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3">
                    <p className="text-zinc-500 text-xs mb-1">Customer Since</p>
                    <p className="font-semibold">Mar 2024</p>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3">
                    <p className="text-zinc-500 text-xs mb-1">Plan</p>
                    <p className="font-semibold text-emerald-400">Premium</p>
                  </div>
                  <div className="bg-zinc-900 rounded-lg p-3">
                    <p className="text-zinc-500 text-xs mb-1">Satisfaction</p>
                    <p className="font-semibold text-green-400">92%</p>
                  </div>
                </div>
              </div>

              {/* MemoryStack Memories */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-medium text-sm">Customer Memory</h4>
                    <span className="text-xs text-zinc-500 ml-auto">Powered by MemoryStack</span>
                  </div>

                  <div className="space-y-3">
                    {customerMemories.map((memory) => (
                      <div
                        key={memory.id}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3"
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                            memory.memory_type === 'preference' ? 'bg-blue-400' :
                            memory.memory_type === 'interaction' ? 'bg-purple-400' :
                            memory.memory_type === 'fact' ? 'bg-emerald-400' : 'bg-zinc-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-300">{memory.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                memory.memory_type === 'preference' ? 'bg-blue-500/20 text-blue-400' :
                                memory.memory_type === 'interaction' ? 'bg-purple-500/20 text-purple-400' :
                                memory.memory_type === 'fact' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'
                              }`}>
                                {memory.memory_type || 'memory'}
                              </span>
                              <span className="text-xs text-zinc-600">
                                {new Date(memory.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {customerMemories.length === 0 && (
                      <div className="text-center py-8 text-zinc-500 text-sm">
                        <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No memories found for this customer</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Insights */}
                <div className="p-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h4 className="font-medium text-sm">AI Insights</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                      <p className="text-xs text-purple-300">
                        <strong>Pattern detected:</strong> Customer has contacted about login issues 3 times in the past month. Consider proactive outreach about account security.
                      </p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-xs text-emerald-300">
                        <strong>Sentiment:</strong> Generally positive interactions. Last CSAT score was 5/5.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-t border-zinc-800">
                  <h4 className="font-medium text-sm mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm flex items-center gap-2 transition-colors">
                      <Mail className="w-4 h-4 text-zinc-400" />
                      Send password reset email
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm flex items-center gap-2 transition-colors">
                      <CheckCircle className="w-4 h-4 text-zinc-400" />
                      Mark as resolved
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-sm flex items-center gap-2 transition-colors">
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                      Escalate to engineering
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
              Select a ticket to view customer context
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
