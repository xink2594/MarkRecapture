// src/components/Visualization.jsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './Visualization.css';

const Visualization = ({ population }) => { // Prop 已更改
  const svgRef = useRef();

  useEffect(() => {
    if (!population || population.length === 0) {
      // 如果没有种群数据，清空画布
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      return;
    }

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    svg.attr('width', width).attr('height', height);

    // 数据预处理：为每个个体分配可视化属性（如果它们还没有的话）
    const processedPopulation = population.map(p => {
      if (p.x !== undefined && p.y !== undefined) {
        return p; // 如果已有坐标，则保留
      }
      let x, y;
      if (p.isMixed === false) {
        x = Math.random() * (width * 0.2);
        y = Math.random() * height;
      } else {
        x = Math.random() * width;
        y = Math.random() * height;
      }
      return { ...p, x, y };
    });

    // D3 数据绑定与绘图，使用 .join() 语法更简洁
    svg.selectAll('circle')
      .data(processedPopulation, d => d.id)
      .join(
        enter => enter.append('circle')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('r', 0) // 从0半径开始
          .call(enter => enter.transition().duration(500) // 进入动画
            .attr('r', d => d.status === 'dead' ? 2 : d.size / 1.5 + 3)
          ),
        update => update
          .call(update => update.transition().duration(500) // 更新动画
            .attr('r', d => d.status === 'dead' ? 2 : d.size / 1.5 + 3)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
          ),
        exit => exit
          .call(exit => exit.transition().duration(500) // 退出动画
            .attr('r', 0)
            .remove()
          )
      )
      .attr('fill', d => {
        if (d.status === 'dead') return '#4a4a4a';
        if (d.status === 'marked' || d.status === 'recaptured') return '#3498db';
        return '#bdc3c7';
      })
      .attr('stroke', d => {
        if (d.status === 'recaptured') return '#e74c3c';
        if (d.hasLostMark) return '#f39c12';
        return 'none';
      })
      .attr('stroke-width', 2.5)
      .attr('opacity', d => d.status === 'dead' ? 0.5 : 1);

  }, [population]); // 依赖项是 population，每一步更新都会重绘

  return (
    <div className="visualization-container">
      <h4>可视化区域</h4>
      <svg ref={svgRef} className="visualization-svg"></svg>
    </div>
  );
};

export default Visualization;