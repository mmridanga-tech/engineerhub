export default function DashboardWelcome() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 p-8 text-white shadow-2xl">
        <h1 className="text-4xl font-bold">
          👋 Welcome to EngineerHub
        </h1>

        <p className="mt-3 text-lg text-indigo-100">
          Your Complete Engineering Toolkit for Electrical, Civil,
          Mechanical & AI Assisted Calculations.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-white/20 px-4 py-2">
            ⚡ 25+ Engineering Tools
          </span>

          <span className="rounded-full bg-white/20 px-4 py-2">
            🤖 AI Ready
          </span>

          <span className="rounded-full bg-white/20 px-4 py-2">
            📄 PDF Reports
          </span>
        </div>
      </div>
    </section>
  );
}