'use client';

import { Lead } from '@/lib/types';
import { getStatusColor, getScoreColor, formatRelativeTime } from '@/lib/utils';
import { Mail, Phone, Linkedin, MoreVertical, Star } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  onAction: (lead: Lead, action: string) => void;
}

export function LeadCard({ lead, onSelect, onAction }: LeadCardProps) {
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(lead)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{lead.name}</h3>
            {lead.score > 0 && (
              <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                {lead.score}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{lead.title}</p>
          <p className="text-sm text-gray-500">{lead.company}</p>
        </div>
        
        <div className="flex items-center gap-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
            {lead.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          <button
            onClick={(e) => { e.stopPropagation(); onAction(lead, 'email'); }}
            className="p-1.5 hover:bg-gray-100 rounded-md hover:text-primary"
            title="Generate Email"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAction(lead, 'call'); }}
            className="p-1.5 hover:bg-gray-100 rounded-md hover:text-primary"
            title="Generate Call Script"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAction(lead, 'linkedin'); }}
            className="p-1.5 hover:bg-gray-100 rounded-md hover:text-primary"
            title="Generate LinkedIn Message"
          >
            <Linkedin className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAction(lead, 'score'); }}
            className="p-1.5 hover:bg-gray-100 rounded-md hover:text-yellow-500"
            title="Score Lead"
          >
            <Star className="w-4 h-4" />
          </button>
        </div>
        
        {lead.lastContactedAt && (
          <span className="text-xs text-gray-400">
            {formatRelativeTime(lead.lastContactedAt)}
          </span>
        )}
      </div>

      {lead.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {lead.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
