// src/App.jsx
import React, { useState, useMemo } from 'react';
import ControlPanel from './components/ControlPanel';
import Visualization from './components/Visualization';
import Results from './components/Results';
import { SimulationEngine } from './simulation/engine';
import { DefaultCaptureStrategy, FishNetCaptureStrategy } from './simulation/strategies';
import './App.css';

function App() {
  const [initialPopulation, setInitialPopulation] = useState(1000);
  const [M_initial, setM_initial] = useState(100);
  const [C_count, setC_count] = useState(100);
  const [species, setSpecies] = useState('default');
  const [meshSize1, setMeshSize1] = useState(3);
  const [meshSize2, setMeshSize2] = useState(3);
  const [factors, setFactors] = useState({
    markedDeath: { enabled: false, rate: 0.1 },
    birthAndDeath: { enabled: false, birthRate: 0.05, deathRate: 0.02 },
    migration: { enabled: false, immigration: 10, emigrationRate: 0.01 },
    unevenMix: { enabled: false },
    trapShy: { enabled: false, avoidRate: 0.5 },
    markLoss: { enabled: false, rate: 0.1 },
  });
  
  // 新增状态
  const [isIdealMode, setIsIdealMode] = useState(false);
  const [simulationStep, setSimulationStep] = useState('idle');
  const [currentPopulation, setCurrentPopulation] = useState([]);
  const [simulationResults, setSimulationResults] = useState(null);

  const engine = useMemo(() => {
    let strategy;
    if (species === 'fish' && !isIdealMode) { // 理想模式下策略无影响
      strategy = new FishNetCaptureStrategy(meshSize1, meshSize2);
    } else {
      strategy = new DefaultCaptureStrategy();
    }
    const settings = { initialPopulation, M_initial, C_count, strategy, factors, isIdealMode };
    return new SimulationEngine(settings);
  }, [initialPopulation, M_initial, C_count, species, meshSize1, meshSize2, factors, isIdealMode]);

  // 新增重置函数
  const handleReset = () => {
    setSimulationStep('idle');
    setCurrentPopulation([]);
    setSimulationResults(null);
  };

  const handleInitialize = () => {
    const initialPop = engine.initializePopulation();
    setCurrentPopulation(initialPop);
    setSimulationResults(null);
    setSimulationStep('initialized');
  };
  const handleMark = () => {
    const markedPop = engine.markFirstCapture(currentPopulation);
    setCurrentPopulation(markedPop);
    setSimulationStep('marked');
  };
  const handleRecapture = () => {
    const { finalPopulation, results } = engine.mixAndRecapture(currentPopulation);
    setCurrentPopulation(finalPopulation);
    setSimulationResults(results);
    setSimulationStep('recaptured');
  };
  const handleFactorChange = (factor, key, value) => {
    setFactors(prev => ({ ...prev, [factor]: { ...prev[factor], [key]: value } }));
  };

  return (
    <div className="app-container">
      <h1>标志重捕法模拟器</h1>
      <main className="main-content">
        <div className="control-panel-wrapper">
          <ControlPanel
            initialPopulation={initialPopulation} setInitialPopulation={setInitialPopulation}
            M_initial={M_initial} setM_initial={setM_initial}
            C_count={C_count} setC_count={setC_count}
            species={species} setSpecies={setSpecies}
            meshSize1={meshSize1} setMeshSize1={setMeshSize1}
            meshSize2={meshSize2} setMeshSize2={setMeshSize2}
            factors={factors} handleFactorChange={handleFactorChange}
            isIdealMode={isIdealMode} setIsIdealMode={setIsIdealMode}
            simulationStep={simulationStep}
            onInitialize={handleInitialize}
            onMark={handleMark}
            onRecapture={handleRecapture}
            onReset={handleReset}
          />
        </div>
        <div className="simulation-area">
          <Visualization population={currentPopulation} />
          <Results results={simulationResults} />
        </div>
      </main>
    </div>
  );
}

export default App;