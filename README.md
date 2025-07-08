# 标志重捕法模拟器

这是一个基于React和Electron的标志重捕法模拟工具，用于生态学研究中的种群估计。

## 开发

```bash
# 安装依赖
npm install

# 启动开发环境
npm run dev
```

## 构建

```bash
# 构建所有平台
npm run dist

# 仅构建Windows版本
npm run dist:win
```

## 发布

本项目通过GitHub Actions自动化构建。当创建新的Release时，会自动触发构建流程并将构建产物上传至Release页面。

### 发布步骤

1. 在GitHub仓库页面点击"Create a new release"
2. 输入版本号（例如v0.1.0）
3. 填写发布说明
4. 点击"Publish release"按钮
5. 等待GitHub Actions完成构建
6. 构建完成后，可在Release页面下载应用程序

## 功能

- 模拟标志重捕法的数据收集过程
- 可视化种群动态
- 提供多种统计分析方法
- 支持不同的捕获策略

## 许可证

请参见LICENSE文件
