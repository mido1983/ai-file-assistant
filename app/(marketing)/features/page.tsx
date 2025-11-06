export default function FeaturesPage() {
  const features = [
    {
      title: 'Automatic Classification',
      desc: 'AI groups your files by type, topic, and context.',
    },
    {
      title: 'Duplicate Detection',
      desc: 'Find and handle duplicates with confidence and clarity.',
    },
    {
      title: 'Smart Collections',
      desc: 'Create dynamic collections using tags and metadata.',
    },
    {
      title: 'AI Summaries',
      desc: 'Get short, helpful summaries for long documents.',
    },
  ];

  return (
    <section className="py-10">
      <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Core Features</h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <li key={f.title} className="rounded-lg border border-zinc-200 p-4">
            <h3 className="font-medium text-zinc-900">{f.title}</h3>
            <p className="mt-1 text-sm text-zinc-700">{f.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

