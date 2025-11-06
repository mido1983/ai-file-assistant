export default function FeaturesPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">What AI File Assistant actually does for you</h1>
        <p className="max-w-3xl text-slate-600">
          Instead of yet another file browser, AI File Assistant behaves like a calm librarian: it reads, labels and structures your documents so you don’t have to.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-slate-900">Automation that feels like magic</h2>
        <ul className="list-disc space-y-1 pl-6 text-slate-700">
          <li>Reads PDFs, images and Office documents using OCR and text extraction.</li>
          <li>Detects document type: invoices, contracts, NDAs, recipes, IDs, tickets and more.</li>
          <li>Suggests tags and smart collections based on real content, not just filenames.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-slate-900">Understanding, not just storage</h2>
        <ul className="list-disc space-y-1 pl-6 text-slate-700">
          <li>Keeps the link to your original folder structure — no vendor lock-in.</li>
          <li>Gives each document a short natural-language summary so you can skim faster.</li>
          <li>Highlights important metadata like dates, totals, and counterparties for invoices and contracts.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium text-slate-900">Control and privacy by design</h2>
        <ul className="list-disc space-y-1 pl-6 text-slate-700">
          <li>Built to be privacy-first: you decide whether analysis happens locally or in the cloud.</li>
          <li>No hard dependency on one storage provider — you can integrate the ones you already use.</li>
          <li>Mock mode lets you design flows and UI long before you connect real data.</li>
        </ul>
      </section>
    </div>
  );
}
