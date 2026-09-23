import { stats, testimonials } from "@/data/testimonials";

import { QuoteIcon, StarIcon } from "@/components/icons";
import { Reveal } from "@/components/ui/Reveal";

export function Testimonials() {
  return (
    <section id="testimoni" className="bg-soft py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 lg:grid-cols-2">
        <div>
          <span className="text-xs font-bold tracking-widest text-brand">
            DIPERCAYA OLEH RIBUAN PENGGUNA
          </span>
          <h2 className="h-display mt-3 text-3xl font-extrabold sm:text-4xl">
            Pilihan Tepat
            <br />
            untuk Kebutuhan Digital Anda
          </h2>
          <p className="mt-4 max-w-md text-muted">
            Bergabunglah bersama ribuan pengguna yang sudah merasakan kemudahan transaksi di
            Belleva.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.id}>
                <p className="text-3xl font-extrabold text-brand">{stat.value}</p>
                <p className="mt-1 text-xs text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <Reveal>
          {testimonials.map((testimonial) => (
            <figure key={testimonial.id} className="card bg-white p-7 shadow-soft">
              <QuoteIcon />
              <blockquote className="mt-4 text-lg leading-relaxed font-semibold">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="blue-grad grid h-11 w-11 place-items-center rounded-pill font-bold text-white">
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-sm font-bold">{testimonial.name}</p>
                  <p className="text-xs text-muted">{testimonial.role}</p>
                </div>
                <span
                  className="ml-auto flex gap-0.5 text-warn"
                  aria-label={`Rating ${testimonial.rating} dari 5`}
                >
                  {Array.from({ length: testimonial.rating }, (_, index) => (
                    <StarIcon key={index} />
                  ))}
                </span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
