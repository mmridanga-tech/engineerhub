import { useState } from "react";
export default function EarthPitCalculatorPage() {
const [soilResistivity, setSoilResistivity] = useState("");
const [rodLength, setRodLength] = useState("");
const [rodDiameter, setRodDiameter] = useState("");
const [rodCount, setRodCount] = useState("");

const [result, setResult] = useState<number | null>(null);
const calculateEarthResistance = () => {
  alert("Calculate Button Clicked");
};
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <h1 className="text-4xl font-bold mb-2">
        🌍 Earth Pit Calculator
      </h1>

      <p className="text-slate-400 mb-8">
        Calculate Earthing Resistance according to IEEE standards.
      </p>

      <div className="grid md:grid-cols-2 gap-8">

        <div className="rounded-2xl bg-slate-900 p-6">

          <h2 className="text-xl font-semibold mb-6">
            Input Parameters
          </h2>

          <div className="space-y-5">

           
            <input
              type="number"
              value={soilResistivity}
              onChange={(e) => setSoilResistivity(e.target.value)}
              className="w-full rounded-xl p-3 bg-slate-800"
    placeholder="Soil Resistivity (Ω·m)"
            />

            <input
  type="number"
  value={rodLength}
  onChange={(e) => setRodLength(e.target.value)}
  className="w-full rounded-xl p-3 bg-slate-800"
  placeholder="Rod Length (m)"
/>

            <input
  type="number"
  value={rodDiameter}
  onChange={(e) => setRodDiameter(e.target.value)}
  className="w-full rounded-xl p-3 bg-slate-800"
  placeholder="Rod Diameter (mm)"
/>
<input
  type="number"
  value={rodCount}
  onChange={(e) => setRodCount(e.target.value)}
  className="w-full rounded-xl p-3 bg-slate-800"
  placeholder="Number of Rods"
/>
<button
   onClick={calculateEarthResistance}
  className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 transition"
>
  Calculate
</button>
          </div>

        </div>

        <div className="rounded-2xl bg-slate-900 p-6">

          <h2 className="text-xl font-semibold mb-6">
            Result
          </h2>

          <div className="text-5xl font-bold text-emerald-400">
            --
          </div>

          <p className="mt-4 text-slate-400">
            Earth Resistance will appear here.
          </p>

        </div>

      </div>

    </div>
  );
}