import DashboardWelcome from "../components/DashboardWelcome";
import DashboardCards from "../components/DashboardCards";
import { Hero } from "../components/Hero";
import { CategoriesGrid } from "../components/CategoriesGrid";
import { PopularToolsGrid } from "../components/PopularToolsGrid";
import { WhyEngineerHub } from "../components/WhyEngineerHub";
import { Contact } from "../components/Contact";
import { FaqSection } from "../components/FaqSection";

export default function HomePage() {
  return (
    <>
      <Hero
        onOpenAIAssistant={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
      />
<DashboardWelcome />
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <DashboardCards />
      </div>

      <CategoriesGrid
        onSelectCategory={() => {}}
      />

      <PopularToolsGrid
        searchQuery=""
        selectedCategory="All"
        onSelectCategory={() => {}}
        onOpenAIAssistant={() => {}}
        onOpenCableCalculator={() => {}}
        onOpenVoltageDropCalculator={() => {}}
        onOpenLoadCalculator={() => {}}
        onOpenMotorCalculator={() => {}}
        onOpenTransformerCalculator={() => {}}
      />

      <WhyEngineerHub />
      <FaqSection />
      <Contact />
    </>
  );
}