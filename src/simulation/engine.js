//模拟器核心引擎

export class SimulationEngine {
  constructor(settings) {
    this.settings = settings; // 接收所有来自UI的设置
    this.population = [];
  }

  // 步骤 1: 初始化种群
  initializePopulation() {
    this.population = [];
    for (let i = 0; i < this.settings.initialPopulation; i++) {
      this.population.push({
        id: i,
        status: 'unmarked', // unmarked, marked, recaptured, dead
        isMarked: false,
        hasLostMark: false,
        captureProbability: 1.0,
        size: 1 + Math.random() * 9,
        isMixed: false,
      });
    }
    // 返回种群快照用于可视化
    return [...this.population];
  }

  // 步骤 2: 首次捕捉与标记
  markFirstCapture(currentPopulation) {
    this.population = [...currentPopulation];
    const captureMethod = this.settings.strategy.selectForCapture.bind(this.settings.strategy);
    const toMark = captureMethod(this.population.filter(p => p.status !== 'dead'), this.settings.M_initial);

    toMark.forEach(individual => {
      const p = this.population.find(p => p.id === individual.id);
      if (p) {
        p.status = 'marked';
        p.isMarked = true;
      }
    });
    return [...this.population];
  }

  // 步骤 3: 混合、应用影响因素并进行二次捕捉
  mixAndRecapture(currentPopulation) {
    this.population = [...currentPopulation];
    
    // 应用各种影响因素 (这部分代码与之前相同)
    if (!this.settings.isIdealMode) {
      this._applyFactors();
    }

    // 进行二次捕捉
    const { C, R } = this._recapture();

    // 计算结果
    const M_actual = this.population.filter(p => p.isMarked && p.status !== 'dead').length;
    const N_final_true = this.population.filter(p => p.status !== 'dead').length;
    const N_estimated_real = (M_actual * C) / (R || 1); // R为0时避免除零

    // --- 修改点：计算带符号的误差 ---
    const raw_error = N_estimated_real - N_final_true;
    const error_percentage = (raw_error / (N_final_true || 1)) * 100;
    const formatted_error = (error_percentage > 0 ? '+' : '') + error_percentage.toFixed(2) + '%';
    
    const results = {
      M: M_actual, C, R,
      N_initial_true: this.settings.initialPopulation, N_final_true,
      N_estimated_real: Math.round(N_estimated_real),
      error: formatted_error, // 使用新的带符号误差
    };

    return { finalPopulation: [...this.population], results };
  }

  // --- 私有辅助方法 ---

  _applyFactors() {

    let currentMaxId = Math.max(...this.population.map(p => p.id));

    // 因素1: 被标记个体死亡 (高于正常死亡率)
    if (this.settings.factors.markedDeath.enabled) {
      this.population.forEach(p => {
        if (p.isMarked && Math.random() < this.settings.factors.markedDeath.rate) {
          p.status = 'dead';
        }
      });
    }

    // 因素2: 自然生死
    if (this.settings.factors.birthAndDeath.enabled) {
      const { birthRate, deathRate } = this.settings.factors.birthAndDeath;
      let births = 0;
      // 死亡
      this.population.forEach(p => {
        if (p.status !== 'dead' && Math.random() < deathRate) {
          p.status = 'dead';
        }
      });
      // 出生
      const livingCount = this.population.filter(p => p.status !== 'dead').length;
      const newBirthsCount = Math.floor(livingCount * birthRate);
      for(let i = 0; i < newBirthsCount; i++) {
        this.population.push({
          id: ++currentMaxId, status: 'unmarked', isMarked: false, hasLostMark: false, captureProbability: 1.0,
          size: 1 + Math.random() * 9, isMixed: false,
        });
      }
    }

    // 因素3: 迁入迁出
    if (this.settings.factors.migration.enabled) {
        const { immigration, emigrationRate } = this.settings.factors.migration;
        // 迁出
        this.population.forEach(p => {
            if (p.status !== 'dead' && Math.random() < emigrationRate) {
                p.status = 'dead'; // 简化处理，视为死亡
            }
        });
        // 迁入
        for(let i = 0; i < immigration; i++) {
            this.population.push({
                id: ++currentMaxId, status: 'unmarked', isMarked: false, hasLostMark: false, captureProbability: 1.0,
                size: 1 + Math.random() * 9, isMixed: false,
            });
        }
    }

    // 因素4: 标志丢失
    if (this.settings.factors.markLoss.enabled) {
      this.population.forEach(p => {
        if (p.isMarked && !p.hasLostMark && Math.random() < this.settings.factors.markLoss.rate) {
          p.isMarked = false; // 逻辑上不再是标记个体
          p.hasLostMark = true; // 记录事实，可用于可视化
          if(p.status === 'marked') p.status = 'unmarked'; // 视觉上变回未标记
        }
      });
    }
    
    // 因素5: 标记个体难以被二次捕捉（陷阱回避）
    if (this.settings.factors.trapShy.enabled) {
        this.population.forEach(p => {
            if (p.isMarked) {
                p.captureProbability = 1.0 - this.settings.factors.trapShy.avoidRate;
            }
        });
    }

    // 因素4 (变体): 分布不均
    if (this.settings.factors.unevenMix.enabled) {
        this.population.forEach(p => {
            if (p.isMarked) {
                // 标记为“未混合”，可视化时可以将它们聚集在某个区域
                p.isMixed = false; 
            } else {
                p.isMixed = true;
            }
        });
    } else {
        this.population.forEach(p => p.isMixed = true);
    }
    // let currentMaxId = Math.max(...this.population.map(p => p.id));
    if (this.settings.factors.markedDeath.enabled) { 
        this.population.forEach(p => { 
            if (p.isMarked && Math.random() < this.settings.factors.markedDeath.rate) { 
                p.status = 'dead'; 
            } 
        }); 
    }
  }

  _recapture() {
    const livingPopulation = this.population.filter(p => p.status !== 'dead');
    const markedPool = livingPopulation.filter(p => p.isMarked);
    const unmarkedPool = livingPopulation.filter(p => !p.isMarked);

    let recapturedSample;

    if (this.settings.isIdealMode) {
      const M_current = markedPool.length;
      const N_current = livingPopulation.length;
      const ideal_R = Math.round(this.settings.C_count * (M_current / N_current));
      
      const recaptured_marked = markedPool.slice(0, ideal_R);
      const recaptured_unmarked = unmarkedPool.slice(0, this.settings.C_count - ideal_R);
      recapturedSample = [...recaptured_marked, ...recaptured_unmarked];
    } else {
      // 原有的随机重捕逻辑
      let samplePool = livingPopulation;
      if (this.settings.factors.unevenMix.enabled) { const mixedPart = livingPopulation.filter(p => p.isMixed); const unmixedPart = livingPopulation.filter(p => !p.isMixed); samplePool = [...mixedPart, ...unmixedPart.slice(0, Math.floor(unmixedPart.length * 0.2))]; }
      samplePool.forEach(p => { if (Math.random() > p.captureProbability) { samplePool = samplePool.filter(sp => sp.id !== p.id); } });
      const recaptureMethod = this.settings.strategy.selectForRecapture?.bind(this.settings.strategy) || this.settings.strategy.selectForCapture.bind(this.settings.strategy);
      recapturedSample = recaptureMethod(samplePool, this.settings.C_count);
    }
    
    const R = recapturedSample.filter(p => p.isMarked).length;
    recapturedSample.forEach(individual => {
      const p = this.population.find(p => p.id === individual.id);
      if (p && p.status !== 'dead') { p.status = 'recaptured'; }
    });
    return { C: recapturedSample.length, R };
  }
}