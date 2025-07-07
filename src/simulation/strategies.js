//定义不同物种的捕捉策略
/**
 * 默认捕捉策略
 * 随机选择个体，不考虑其他属性。
 */
export class DefaultCaptureStrategy {
  /**
   * @param {Array<Object>} population - 当前种群数组
   * @param {number} count - 希望捕捉的数量
   * @returns {Array<Object>} - 被捕捉的个体数组
   */
  selectForCapture(population, count) {
    // 创建一个副本并打乱顺序
    const shuffled = [...population].sort(() => 0.5 - Math.random());
    // 返回前 count 个个体
    return shuffled.slice(0, count);
  }
}

/**
 * 鱼类渔网捕捉策略
 * 捕捉行为受渔网网眼大小影响，只有大于网眼尺寸的鱼才会被捕获。
 */
export class FishNetCaptureStrategy {
  constructor(meshSize1, meshSize2) {
    this.meshSize1 = meshSize1; // 首次捕捉的网眼大小
    this.meshSize2 = meshSize2; // 第二次捕捉的网眼大小
  }

  /**
   * 首次捕捉
   * @param {Array<Object>} population - 种群数组
   * @param {number} count - 希望捕捉的数量
   * @returns {Array<Object>} - 被捕捉的个体数组
   */
  selectForCapture(population, count) {
    // 筛选出大于第一次网眼大小的鱼
    const catchable = population.filter(fish => fish.size > this.meshSize1);
    const shuffled = catchable.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * 第二次捕捉
   * @param {Array<Object>} population - 种群数组
   * @param {number} count - 希望捕捉的数量
   * @returns {Array<Object>} - 被捕捉的个体数组
   */
  selectForRecapture(population, count) {
    // 筛选出大于第二次网眼大小的鱼
    const catchable = population.filter(fish => fish.size > this.meshSize2);
    const shuffled = catchable.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}