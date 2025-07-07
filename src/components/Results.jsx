// src/components/Results.jsx
import React from 'react';
import './Results.css';

const Results = ({ results }) => {
  if (!results) {
    return <div className="results-panel" style={{textAlign: 'center', color: '#7f8c8d'}}>请完成所有模拟步骤以查看结果。</div>;
  }

  const { M, C, R, N_initial_true, N_final_true, N_estimated_real, error } = results;

  // --- 修改点：根据误差的符号判断偏大或偏小 ---
  const getErrorText = (errorString) => {
    if (errorString.startsWith('+')) {
      return `(偏大 ${errorString})`;
    }
    if (errorString.startsWith('-')) {
      return `(偏小 ${errorString})`;
    }
    return `(${errorString})`; // 如果是 0.00%
  };

  const errorText = getErrorText(error);

  return (
    <div className="results-panel">
      <h3>模拟结果</h3>
      <div className="result-grid">
        <div><strong>初始真实种群:</strong> {N_initial_true}</div>
        <div><strong>最终真实种群:</strong> {N_final_true}</div>
        <hr/>
        <div><strong>有效标记数 (M):</strong> {M}</div>
        <div><strong>二次捕捉数 (C):</strong> {C}</div>
        <div><strong>重捕数 (R):</strong> {R}</div>
        <hr/>
        <div className="emphasis"><strong>模拟估算值 (N_real):</strong> {N_estimated_real}</div>
        <div className="error">
          <strong>与最终真实值误差: </strong> 
          {errorText}
        </div>
      </div>
    </div>
  );
};

export default Results;