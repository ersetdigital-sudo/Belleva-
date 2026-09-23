import { features } from "@/data/features";

import { FeatureIcon } from "@/components/icons";
import { Reveal } from "@/components/ui/Reveal";

export function Features() {
  return (
    <section id="keunggulan" className="bg-soft py-16">
      <div className="mx-auto max-w-6xl px-5">
        {/* The original had no heading here; this keeps the H1 > H2 > H3 outline valid. */}
        <h2 className="sr-only">Keunggulan Belleva</h2>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <li key={feature.id}>
              <Reveal delay={index * 0.08} className="h-full">
                <div className="card feat h-full p-6">
                  <span className="ico" style={{ background: feature.gradient }}>
                    <FeatureIcon id={feature.id} />
                  </span>
                  <h3 className="mt-4 font-bold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{feature.description}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
