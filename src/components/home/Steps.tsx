import { steps } from "@/data/steps";

import { Reveal } from "@/components/ui/Reveal";

export function Steps() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 text-center">
      <span className="text-xs font-bold tracking-widest text-brand">CARA MUDAH TRANSAKSI</span>
      <h2 className="h-display mt-3 text-3xl font-extrabold sm:text-4xl">3 Langkah, Beres!</h2>
      <p className="mt-3 text-muted">Transaksi jadi lebih mudah dan cepat.</p>

      <ol className="mt-10 grid gap-6 text-left sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.number}>
            <Reveal delay={index * 0.08} className="h-full">
              <div className="card h-full p-6">
                <span className="blue-grad grid h-9 w-9 place-items-center rounded-pill text-sm font-bold text-white">
                  {step.number}
                </span>
                <h3 className="mt-4 font-bold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{step.description}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
