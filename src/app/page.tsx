export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <h1 className="text-3xl sm:text-5xl font-bold max-w-3xl leading-tight">
        Buy Qualified Business-Loan Leads in Minutes
      </h1>
      <p className="mt-6 max-w-xl text-lg text-gray-600 dark:text-gray-300">
        Browse fresh, pre-qualified business-loan prospects filtered by age,
        industry, revenue, and more. Pay only for the leads you need—instantly
        download after purchase.
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <a
          href="/browse"
          className="bg-black text-white dark:bg-white dark:text-black rounded-md px-6 py-3 text-base font-medium hover:opacity-90 transition"
        >
          Browse Leads
        </a>
        <a
          href="/login"
          className="border border-black dark:border-white text-black dark:text-white rounded-md px-6 py-3 text-base font-medium hover:bg-black/10 dark:hover:bg-white/10 transition"
        >
          Get Started
        </a>
      </div>
    </section>
  );
}
