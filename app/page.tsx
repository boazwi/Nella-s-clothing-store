import { ProductGrid } from "@/components/product/ProductGrid";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            See it on you, before you buy
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
            Browse our collection, upload a photo of yourself, and try any piece on
            instantly with Nella&apos;s AI virtual try-on.
          </p>
        </div>
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 font-serif text-2xl text-ink">The Collection</h2>
        <ProductGrid />
      </section>
    </div>
  );
}
