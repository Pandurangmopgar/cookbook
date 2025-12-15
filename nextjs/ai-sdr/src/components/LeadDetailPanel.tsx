'use client';

import { useState, useEffect } from 'react';
import { Lead, Interaction } from '@/lib/types';
import { getStatusColor, getScoreColor, formatDate, formatRelativeTime } from '@/lib/utils';
import { X, Mail, Phone, Linkedin, Star, Copy, Check, Send, Loader2 } from 'lucide-react';

interface LeadDetailPanelProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}

type ActionType = 'email' | 'call' | 'linkedin' | 'score' | null;

export function LeadDetailPanel({ lead, onClose, onUpdate }: LeadDetailPanelProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailType, setEmailType] = useState<'cold' | 'followup' | 'breakup' | 'meeting_request'>('cold');

  useEffect(() => {
    fetchLeadDetails();
  }, [lead.id]);

  const fetchLeadDetails = async () => {
    const res = await fetch(`/api/leads/${lead.id}`);
    if (res.ok) {
      const data = await res.json();
      setInteractions(data.interactions || []);
    }
  };

  const generateEmail = async () => {
    setLoading(true);
    setGeneratedContent(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailType }),
      });
      if (res.ok) {
        const { email } = await res.json();
        setGeneratedContent(email);
        setActiveAction('email');
      }
    } catch (e) {
      console.error('Failed to generate email:', e);
    } finally {
      setLoading(false);
    }
  };

  const generateCallScript = async () => {
    setLoading(true);
    setGeneratedContent(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objective: 'Schedule a discovery call' }),
      });
      if (res.ok) {
        const { script } = await res.json();
        setGeneratedContent(script);
        setActiveAction('call');
      }
    } catch (e) {
      console.error('Failed to generate call script:', e);
    } finally {
      setLoading(false);
    }
  };

  const generateLinkedIn = async () => {
    setLoading(true);
    setGeneratedContent(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}/linkedin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageType: 'connection' }),
      });
      if (res.ok) {
        const { message } = await res.json();
        setGeneratedContent({ message });
        setActiveAction('linkedin');
      }
    } catch (e) {
      console.error('Failed to generate LinkedIn message:', e);
    } finally {
      setLoading(false);
    }
  };

  const scoreLead = async () => {
    setLoading(true);
    setGeneratedContent(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}/score`, {
        method: 'POST',
      });
      if (res.ok) {
        const scoreData = await res.json();
        setGeneratedContent(scoreData);
        setActiveAction('score');
        onUpdate({ ...lead, score: scoreData.score });
      }
    } catch (e) {
      console.error('Failed to score lead:', e);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (sendReal: boolean = false) => {
    if (!generatedContent) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: generatedContent.subject,
          body: generatedContent.body,
          sendReal,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (sendReal && data.emailSent) {
          alert(`Email sent successfully! Message ID: ${data.messageId}`);
        }
        fetchLeadDetails();
        setGeneratedContent(null);
        setActiveAction(null);
      }
    } catch (e) {
      console.error('Failed to send email:', e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{lead.name}</h2>
          <p className="text-sm text-gray-500">{lead.title} at {lead.company}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Lead Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{lead.email}</p>
          </div>
          {lead.phone && (
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{lead.phone}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
              {lead.status.replace('_', ' ')}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Score</p>
            <span className={`font-bold text-lg ${getScoreColor(lead.score)}`}>
              {lead.score || 'Not scored'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="cold">Cold Email</option>
              <option value="followup">Follow-up</option>
              <option value="breakup">Breakup</option>
              <option value="meeting_request">Meeting Request</option>
            </select>
            <button
              onClick={generateEmail}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              Generate Email
            </button>
          </div>
          <button
            onClick={generateCallScript}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Phone className="w-4 h-4" />
            Call Script
          </button>
          <button
            onClick={generateLinkedIn}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </button>
          <button
            onClick={scoreLead}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
          >
            <Star className="w-4 h-4" />
            Score Lead
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Generating with AI...</span>
          </div>
        )}

        {/* Generated Content */}
        {generatedContent && activeAction === 'email' && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Generated Email</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(`Subject: ${generatedContent.subject}\n\n${generatedContent.body}`)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => sendEmail(false)}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Log Only
                </button>
                <button
                  onClick={() => sendEmail(true)}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark"
                >
                  <Send className="w-4 h-4" />
                  Send Email
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subject</p>
              <p className="font-medium">{generatedContent.subject}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Body</p>
              <p className="whitespace-pre-wrap text-gray-700">{generatedContent.body}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CTA</p>
              <p className="text-primary font-medium">{generatedContent.callToAction}</p>
            </div>
          </div>
        )}

        {generatedContent && activeAction === 'call' && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Call Script</h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(generatedContent, null, 2))}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Opener</p>
              <p className="text-gray-700">{generatedContent.opener}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Value Proposition</p>
              <p className="text-gray-700">{generatedContent.valueProposition}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Qualifying Questions</p>
              <ul className="list-disc list-inside text-gray-700">
                {generatedContent.qualifyingQuestions?.map((q: string, i: number) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Objection Handlers</p>
              {Object.entries(generatedContent.objectionHandlers || {}).map(([obj, response]) => (
                <div key={obj} className="ml-2 mt-1">
                  <span className="text-red-600 font-medium">"{obj}"</span>
                  <span className="text-gray-500"> → </span>
                  <span className="text-gray-700">{response as string}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Close</p>
              <p className="text-primary font-medium">{generatedContent.closeAttempt}</p>
            </div>
          </div>
        )}

        {generatedContent && activeAction === 'linkedin' && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">LinkedIn Message</h3>
              <button
                onClick={() => copyToClipboard(generatedContent.message)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{generatedContent.message}</p>
          </div>
        )}

        {generatedContent && activeAction === 'score' && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Lead Score Analysis</h3>
              <span className={`text-3xl font-bold ${getScoreColor(generatedContent.score)}`}>
                {generatedContent.score}/100
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Scoring Factors</p>
              <div className="space-y-2 mt-2">
                {generatedContent.factors?.map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-white p-2 rounded">
                    <span className="text-gray-700">{f.factor}</span>
                    <span className={`font-medium ${f.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {f.impact > 0 ? '+' : ''}{f.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Recommendation</p>
              <p className="text-gray-700">{generatedContent.recommendation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Next Best Action</p>
              <p className="text-primary font-medium">{generatedContent.nextBestAction}</p>
            </div>
          </div>
        )}

        {/* Interaction History */}
        <div>
          <h3 className="font-semibold mb-3">Interaction History</h3>
          {interactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No interactions yet</p>
          ) : (
            <div className="space-y-3">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium uppercase text-gray-500">
                      {interaction.type} • {interaction.direction}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(interaction.createdAt)}
                    </span>
                  </div>
                  {interaction.subject && (
                    <p className="font-medium text-sm">{interaction.subject}</p>
                  )}
                  <p className="text-sm text-gray-700 line-clamp-2">{interaction.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
