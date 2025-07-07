// src/components/ControlPanel.jsx
import React from 'react';
import './ControlPanel.css';

const factorLabels = {
  markedDeath: "markedDeath (标志个体额外死亡)",
  birthAndDeath: "birthAndDeath (自然生死)",
  migration: "migration (迁入迁出)",
  unevenMix: "unevenMix (分布不均)",
  trapShy: "trapShy (陷阱回避)",
  markLoss: "markLoss (标志丢失)",
};

const ControlPanel = (props) => {
  const {
    initialPopulation, setInitialPopulation,
    M_initial, setM_initial,
    C_count, setC_count,
    species, setSpecies,
    meshSize1, setMeshSize1,
    meshSize2, setMeshSize2,
    factors, handleFactorChange,
    isIdealMode, setIsIdealMode, // 新增
    simulationStep, onInitialize, onMark, onRecapture, onReset // 新增
  } = props;

  const isIdle = simulationStep === 'idle';
  const isInitialized = simulationStep === 'initialized';
  const isMarked = simulationStep === 'marked';

  return (
    <div className="panel">
      <div className="reset-button-wrapper">
          <button className="reset-button" onClick={onReset} disabled={isIdle}>重置/开始新模拟</button>
      </div>
      <div className="steps-buttons">
          <button onClick={onInitialize} disabled={!isIdle}>1. 初始化种群</button>
          <button onClick={onMark} disabled={!isInitialized}>2. 首次捕捉标记</button>
          <button onClick={onRecapture} disabled={!isMarked}>3. 混合与二次捕捉</button>
      </div>

      <h3>基础设置</h3>
      <div className="form-group">
        <label>初始种群数量:</label>
        <input type="number" value={initialPopulation} placeholder="例如: 100-5000" onChange={(e) => setInitialPopulation(Number(e.target.value))} disabled={!isIdle} />
      </div>
      {/* ... M 和 C 的输入框保持不变 ... */}
      <div className="form-group">
        <label>首次捕捉标记数 (M):</label>
        <input type="number" value={M_initial} placeholder="例如: 10-500" onChange={(e) => setM_initial(Number(e.target.value))} disabled={!isIdle}/>
      </div>
      <div className="form-group">
        <label>二次捕捉数量 (C):</label>
        <input type="number" value={C_count} placeholder="例如: 10-500" onChange={(e) => setC_count(Number(e.target.value))} disabled={!isIdle}/>
      </div>

      <h3>物种与策略</h3>
      <div className="form-group">
          <label>模拟物种: </label>
          <select value={species} onChange={e => setSpecies(e.target.value)} disabled={!isIdle || isIdealMode}>
              <option value="default">默认物种</option>
              <option value="fish">鱼（渔网捕捉）</option>
          </select>
      </div>
      {/* ... 鱼类设置保持不变 ... */}
      {species === 'fish' && (
          <>
            <div className="form-group">
                <label>首次捕捞网眼(cm): {meshSize1}</label>
                <input type="range" min="1" max="9" step="0.5" value={meshSize1} onChange={e => setMeshSize1(Number(e.target.value))} disabled={!isIdle || isIdealMode}/>
            </div>
            <div className="form-group">
                <label>二次捕捞网眼(cm): {meshSize2}</label>
                <input type="range" min="1" max="9" step="0.5" value={meshSize2} onChange={e => setMeshSize2(Number(e.target.value))} disabled={!isIdle || isIdealMode}/>
            </div>
          </>
      )}


      <h3>影响因素</h3>
      <div className="form-group checkbox">
          <input type="checkbox" id="idealMode" checked={isIdealMode} onChange={(e) => setIsIdealMode(e.target.checked)} disabled={!isIdle}/>
          <label htmlFor="idealMode" style={{fontWeight: 'bold', color: '#2980b9'}}>最理想状态 (无随机性)</label>
      </div>
      <hr style={{border: '0', borderTop: '1px solid #eee'}}/>
      {Object.keys(factors).map(key => (
        <div className="form-group checkbox" key={key}>
          <input
            type="checkbox"
            id={key}
            checked={factors[key].enabled}
            onChange={(e) => handleFactorChange(key, 'enabled', e.target.checked)}
            disabled={isIdealMode} /* 理想模式下禁用所有其他因素 */
          />
          <label htmlFor={key} style={{color: isIdealMode ? '#ccc' : 'inherit'}}>{factorLabels[key]}</label>
        </div>
      ))}
    </div>
  );
};

export default ControlPanel;