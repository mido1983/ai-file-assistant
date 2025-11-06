'use client';

import { useState } from 'react';

const ITEMS = [
  {
    q: 'Is this connected to real data?',
    a: 'This MVP uses mock data and a local in-memory API. No external services are used.',
  },
  {
    q: 'How does AI analysis work?',
    a: 'We simulate AI analysis that categorizes files and generates short summaries.',
  },
  {
    q: 'Do I need a credit card?',
    a: 'No credit card needed to try the mock MVP. Upgrade prompts are informational only.',
  },
  {
    q: 'Can I invite my team?',
    a: 'Team features are planned for the Business tier and will be added in future iterations.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-slate-900">FAQ</h3>
      <ul className="divide-y divide-slate-200">
        {ITEMS.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <li key={item.q} className="py-3">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="font-medium text-slate-900">{item.q}</span>
                <span className="text-slate-500">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

