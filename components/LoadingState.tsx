import React, { useEffect, useState } from 'react';

const steps = [
  "Initializing Agent...",
  "Searching Global Database...",
  "Scanning Official Websites & Press...",
  "Digging into Social Media & Communities...",
  "Cross-referencing Sources...",
  "Extracting Key Information...",
  "Formatting Research Cases..."
];

export const LoadingState: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Step progress timer
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500); // Slower steps to match realistic API time

    // Elapsed time timer
    const timeInterval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-20 bg-white p-10 rounded-3xl shadow-xl border border-indigo-50 animate-fade-in">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 mb-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-indigo-800">
             {elapsedSeconds}s
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Agent is Working</h3>
        <p className="text-indigo-600 font-medium text-center mb-2 h-6">{steps[currentStep]}</p>
        
        <p className="text-gray-400 text-xs text-center mb-8 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
          Deep research typically takes <strong>30-60 seconds</strong> depending on the volume of data found.
        </p>

        <div className="w-full space-y-3 bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
             <span>Task Progress</span>
             <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="mt-4 space-y-2">
             {steps.slice(0, currentStep + 1).slice(-3).map((s, i) => (
                <div key={i} className="flex items-center text-sm text-gray-600 animate-slide-in-right">
                   <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                   {s}
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};