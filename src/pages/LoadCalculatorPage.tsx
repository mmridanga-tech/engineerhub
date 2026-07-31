import { LoadCalculatorPage } from "../components/LoadCalculatorPage";

export default function LoadCalculator() {
  return (
    <LoadCalculatorPage
      onBackToHome={() => {}}
      onOpenAIAssistant={() => {}}
      onOpenCableSizeCalculator={() => {}}
      onOpenVoltageDropCalculator={() => {}}
      onOpenMotorCalculator={() => {}}
      onOpenTransformerCalculator={() => {}}
    />
  );
}