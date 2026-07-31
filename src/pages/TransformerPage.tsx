import { TransformerCalculatorPage } from "../components/TransformerCalculatorPage";

export default function TransformerPage() {
  return (
    <TransformerCalculatorPage
      onBackToHome={() => {}}
      onOpenAIAssistant={() => {}}
      onOpenCableSizeCalculator={() => {}}
      onOpenVoltageDropCalculator={() => {}}
      onOpenLoadCalculator={() => {}}
      onOpenMotorCalculator={() => {}}
    />
  );
}