import { VoltageDropCalculatorPage } from "../components/VoltageDropCalculatorPage";

export default function VoltageDropPage() {
  return (
    <VoltageDropCalculatorPage
      onBackToHome={() => {}}
      onOpenAIAssistant={() => {}}
      onOpenCableSizeCalculator={() => {}}
      onOpenLoadCalculator={() => {}}
      onOpenMotorCalculator={() => {}}
      onOpenTransformerCalculator={() => {}}
    />
  );
}