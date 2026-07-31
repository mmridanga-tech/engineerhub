import { CableSizeCalculatorPage } from "../components/CableSizeCalculatorPage";

export default function CableSizePage() {
  return (
    <CableSizeCalculatorPage
      onBackToHome={() => {}}
      onOpenAIAssistant={() => {}}
      onOpenVoltageDropCalculator={() => {}}
      onOpenLoadCalculator={() => {}}
      onOpenMotorCalculator={() => {}}
      onOpenTransformerCalculator={() => {}}
    />
  );
}