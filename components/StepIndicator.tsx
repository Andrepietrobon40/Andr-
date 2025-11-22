import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = ["Ideia", "Sumário", "Conteúdo", "Capa", "Baixar"];

const Step: React.FC<{ stepNumber: number; label: string; isActive: boolean; isCompleted: boolean }> = ({ stepNumber, label, isActive, isCompleted }) => {
  const baseClasses = "w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all duration-300";
  const activeClasses = "bg-yellow-500 text-black shadow-lg shadow-yellow-500/50";
  const completedClasses = "bg-yellow-600 text-black";
  const inactiveClasses = "bg-gray-800 text-gray-500";
  
  const getStepClasses = () => {
    if (isActive) return activeClasses;
    if (isCompleted) return completedClasses;
    return inactiveClasses;
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`${baseClasses} ${getStepClasses()}`}>{isCompleted && !isActive ? '✔' : stepNumber}</div>
      <p className={`mt-2 text-sm font-medium ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>{label}</p>
    </div>
  );
};

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex justify-between items-start mb-8 px-4">
      {steps.map((label, index) => (
        <React.Fragment key={index}>
          <Step 
            stepNumber={index + 1}
            label={label}
            isActive={currentStep === index + 1}
            isCompleted={currentStep > index + 1}
          />
          {index < steps.length - 1 && (
             <div className={`flex-1 h-1 rounded mx-2 mt-5 ${currentStep > index + 1 ? 'bg-yellow-600' : 'bg-gray-800'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;