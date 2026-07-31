export default function DashboardCards() {
  const cards = [
    {
      title: "Engineering Tools",
      value: "25+",
      color: "from-indigo-500 to-violet-600",
    },
    {
      title: "Calculations",
      value: "0",
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "PDF Reports",
      value: "0",
      color: "from-orange-500 to-red-500",
    },
    {
      title: "AI Status",
      value: "Ready",
      color: "from-cyan-500 to-blue-600",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`rounded-2xl bg-gradient-to-r ${card.color} p-6 text-white shadow-lg`}
        >
          <h3 className="text-sm opacity-80">{card.title}</h3>

          <p className="mt-3 text-3xl font-bold">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}