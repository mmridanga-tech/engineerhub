import { MotorCurrentCalculatorPage } from "../components/MotorCurrentCalculatorPage";

export default function MotorCurrentPage() {
  return (
    <MotorCurrentCalculatorPage
      onBackToHome={() => {}}
      onOpenAIAssistant={() => {}}
      onOpenCableSizeCalculator={() => {}}
      onOpenVoltageDropCalculator={() => {}}
      onOpenLoadCalculator={() => {}}
      onOpenTransformerCalculator={() => {}}
    />
  );
}