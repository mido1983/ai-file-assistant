'use client';

import { useState } from 'react';

const ITEMS = [
  {
    q: 'Is this already connected to my real cloud storage?',
    a: 'Not yet. This MVP uses mock data and an in-memory API so you can design flows and UI first. Later you can plug in Google Drive, OneDrive or your own storage.',
  },
  {
    q: 'What kinds of files does AI File Assistant target?',
    a: 'The goal is to help with everything that clutters your life: invoices, contracts, IDs, insurance docs, recipes, screenshots and more.',
  },
  {
    q: 'Will my files leave my machine?',
    a: 'The real product can be built with a privacy-first architecture. For now, in this playground, nothing is sent to third-party services — it all runs locally or with mock calls.',
  },
  {
    q: 'What’s the difference between Free, Pro and Business?',
    a: 'Free is for testing the idea on a small folder. Pro adds higher limits and more automation. Business is designed for teams with shared workspaces, access control and custom rules.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-slate-900">FAQ</h3>
      <ul className="divide-y divide-slate-200">
        {ITEMS.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <li key={item.q} className="py-3 transition hover:bg-slate-50 rounded-md px-2 -mx-2">
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
