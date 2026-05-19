/**
 * 图表配置模块
 * Chart.js 图表配置和工具函数
 */

const ChartConfig = {
  // 主题色
  colors: {
    primary: '#c41e3a',
    primaryLight: 'rgba(196, 30, 58, 0.2)',
    success: '#28a745',
    successLight: 'rgba(40, 167, 69, 0.2)',
    info: '#17a2b8',
    infoLight: 'rgba(23, 162, 184, 0.2)',
    warning: '#ffc107',
    warningLight: 'rgba(255, 193, 7, 0.2)',
    danger: '#dc3545',
    dangerLight: 'rgba(220, 53, 69, 0.2)',
    purple: '#6f42c1',
    purpleLight: 'rgba(111, 66, 193, 0.2)',
    orange: '#fd7e14',
    orangeLight: 'rgba(253, 126, 20, 0.2)',
    teal: '#20c997',
    tealLight: 'rgba(32, 201, 151, 0.2)',
    pink: '#e83e8c',
    pinkLight: 'rgba(232, 62, 140, 0.2)'
  },

  // 预定义颜色数组
  colorArray: [
    '#c41e3a', '#28a745', '#17a2b8', '#ffc107', 
    '#6f42c1', '#fd7e14', '#20c997', '#e83e8c',
    '#6c757d', '#343a40'
  ],

  /**
   * 获取饼图配置
   * @param {Object} data - 数据 {labels: [], values: []}
   * @param {string} title - 图表标题
   * @returns {Object} Chart.js 配置
   */
  getPieConfig(data, title = '') {
    return {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: this.colorArray.slice(0, data.labels.length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: { size: 12 }
            }
          },
          title: {
            display: !!title,
            text: title,
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 15 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: ${context.raw} (${percentage}%)`;
              }
            }
          }
        }
      }
    };
  },

  /**
   * 获取环形图配置
   * @param {Object} data - 数据 {labels: [], values: []}
   * @param {string} title - 图表标题
   * @returns {Object} Chart.js 配置
   */
  getDoughnutConfig(data, title = '') {
    const config = this.getPieConfig(data, title);
    config.type = 'doughnut';
    config.options.cutout = '60%';
    return config;
  },

  /**
   * 获取柱状图配置
   * @param {Object} data - 数据 {labels: [], datasets: [{label, values}]}
   * @param {string} title - 图表标题
   * @returns {Object} Chart.js 配置
   */
  getBarConfig(data, title = '') {
    return {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: data.datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.values,
          backgroundColor: this.colorArray[i % this.colorArray.length],
          borderRadius: 4,
          barThickness: 30
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: data.datasets.length > 1,
            position: 'top',
            labels: {
              padding: 15,
              usePointStyle: true
            }
          },
          title: {
            display: !!title,
            text: title,
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { size: 11 }
            }
          }
        }
      }
    };
  },

  /**
   * 获取水平柱状图配置
   * @param {Object} data - 数据 {labels: [], values: []}
   * @param {string} title - 图表标题
   * @returns {Object} Chart.js 配置
   */
  getHorizontalBarConfig(data, title = '') {
    return {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: this.colorArray[0],
          borderRadius: 4,
          barThickness: 25
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: !!title,
            text: title,
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.raw} 人`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          },
          y: {
            grid: {
              display: false
            },
            ticks: {
              font: { size: 12 }
            }
          }
        }
      }
    };
  },

  /**
   * 获取折线图配置
   * @param {Object} data - 数据 {labels: [], datasets: [{label, values}]}
   * @param {string} title - 图表标题
   * @returns {Object} Chart.js 配置
   */
  getLineConfig(data, title = '') {
    return {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.values,
          borderColor: this.colorArray[i % this.colorArray.length],
          backgroundColor: this.colorArray[i % this.colorArray.length] + '20',
          tension: 0.3,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: data.datasets.length > 1,
            position: 'top'
          },
          title: {
            display: !!title,
            text: title,
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0,0,0,0.05)'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { size: 11 }
            }
          }
        }
      }
    };
  },

  /**
   * 获取雷达图配置
   * @param {Object} data - 数据 {labels: [], values: []}
   * @param {string} title - 图表标题
   * @returns {Object} Chart.js 配置
   */
  getRadarConfig(data, title = '') {
    return {
      type: 'radar',
      data: {
        labels: data.labels,
        datasets: [{
          label: '党员画像',
          data: data.values,
          backgroundColor: this.colors.primaryLight,
          borderColor: this.colors.primary,
          borderWidth: 2,
          pointBackgroundColor: this.colors.primary,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: this.colors.primary
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: !!title,
            text: title,
            font: { size: 16, weight: 'bold' }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              backdropColor: 'transparent'
            },
            grid: {
              color: 'rgba(0,0,0,0.1)'
            },
            pointLabels: {
              font: { size: 12 }
            }
          }
        }
      }
    };
  },

  /**
   * 创建图表
   * @param {string} canvasId - Canvas元素ID
   * @param {Object} config - 图表配置
   * @returns {Chart} Chart实例
   */
  createChart(canvasId, config) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    // 销毁已存在的图表
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
      existingChart.destroy();
    }
    
    return new Chart(ctx, config);
  },

  /**
   * 更新图表数据
   * @param {Chart} chart - Chart实例
   * @param {Object} data - 新数据
   */
  updateChartData(chart, data) {
    if (!chart) return;
    chart.data.labels = data.labels;
    if (data.values) {
      chart.data.datasets[0].data = data.values;
    }
    if (data.datasets) {
      chart.data.datasets = data.datasets;
    }
    chart.update();
  }
};

// 导出供全局使用
window.ChartConfig = ChartConfig;
