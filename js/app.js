/**
 * 主应用模块
 * 公共函数和组件
 */

const App = {
  // 当前页面
  currentPage: 'index',

  /**
   * 初始化应用
   */
  init() {
    // 初始化示例数据
    DataManager.initSampleData();
    
    // 高亮当前导航
    this.highlightNav();
    
    // 绑定事件
    this.bindEvents();
  },

  /**
   * 高亮当前导航项
   */
  highlightNav() {
    const path = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      if (path.includes(item.getAttribute('href'))) {
        item.classList.add('active');
      }
    });
  },

  /**
   * 绑定全局事件
   */
  bindEvents() {
    // 移动端菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
      });
    }
  },

  /**
   * 格式化日期
   * @param {string} dateStr - 日期字符串
   * @returns {string} 格式化后的日期
   */
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },

  /**
   * 格式化日期时间
   * @param {string} dateStr - 日期字符串
   * @returns {string} 格式化后的日期时间
   */
  formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * 获取相对时间
   * @param {string} dateStr - 日期字符串
   * @returns {string} 相对时间描述
   */
  getRelativeTime(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    if (days < 365) return `${Math.floor(days / 30)}个月前`;
    return `${Math.floor(days / 365)}年前`;
  },

  /**
   * 显示提示消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型 (success/error/warning/info)
   */
  showToast(message, type = 'info') {
    // 创建toast容器
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      background: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      margin-bottom: 10px;
      animation: slideIn 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 250px;
    `;
    
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    toast.innerHTML = `
      <span style="color:${colors[type]};font-size:18px;">${icons[type]}</span>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // 自动移除
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /**
   * 确认对话框
   * @param {string} message - 确认消息
   * @returns {Promise} 用户确认结果
   */
  confirm(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active';
      overlay.innerHTML = `
        <div class="modal" style="max-width:400px;">
          <div class="modal-header">
            <h3 class="modal-title">确认操作</h3>
          </div>
          <div class="modal-body">
            <p>${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-action="cancel">取消</button>
            <button class="btn btn-danger" data-action="confirm">确认</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      
      overlay.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'confirm') {
          resolve(true);
        } else if (action === 'cancel' || e.target === overlay) {
          resolve(false);
        }
        overlay.remove();
      });
    });
  },

  /**
   * 打开模态框
   * @param {string} modalId - 模态框ID
   */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  /**
   * 关闭模态框
   * @param {string} modalId - 模态框ID
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  /**
   * 获取表单数据
   * @param {string} formId - 表单ID
   * @returns {Object} 表单数据对象
   */
  getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};
    
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      // 处理多选框
      const input = form.querySelector(`[name="${key}"]`);
      if (input && input.type === 'checkbox') {
        data[key] = form.querySelectorAll(`[name="${key}"]:checked`).length > 0;
      } else {
        data[key] = value;
      }
    }
    
    // 处理多选select
    const multiSelects = form.querySelectorAll('select[multiple]');
    multiSelects.forEach(select => {
      const selected = Array.from(select.selectedOptions).map(opt => opt.value);
      data[select.name] = selected;
    });
    
    return data;
  },

  /**
   * 重置表单
   * @param {string} formId - 表单ID
   */
  resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
  },

  /**
   * 填充表单数据
   * @param {string} formId - 表单ID
   * @param {Object} data - 数据对象
   */
  fillForm(formId, data) {
    const form = document.getElementById(formId);
    if (!form || !data) return;
    
    for (let key in data) {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = !!data[key];
        } else {
          input.value = data[key] || '';
        }
      }
    }
  },

  /**
   * 导出数据为CSV
   * @param {Array} data - 数据数组
   * @param {Array} headers - 表头配置 [{key, label}]
   * @param {string} filename - 文件名
   */
  exportCSV(data, headers, filename) {
    if (!data || data.length === 0) {
      this.showToast('没有可导出的数据', 'warning');
      return;
    }
    
    // 生成CSV内容
    const headerRow = headers.map(h => h.label).join(',');
    const rows = data.map(item => {
      return headers.map(h => {
        let value = item[h.key] || '';
        // 处理逗号和换行
        if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        // 处理数组
        if (Array.isArray(value)) {
          value = value.join('; ');
        }
        return value;
      }).join(',');
    });
    
    const csv = [headerRow, ...rows].join('\n');
    
    // 下载文件
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showToast('导出成功', 'success');
  },

  /**
   * 生成随机ID
   * @returns {string} 随机ID
   */
  generateId() {
    return DataManager.generateId();
  },

  /**
   * 获取状态标签类名
   * @param {string} status - 状态值
   * @returns {string} CSS类名
   */
  getStatusTagClass(status) {
    const classMap = {
      '正常': 'tag-green',
      '流动': 'tag-blue',
      '失联': 'tag-red',
      '正式党员': 'tag-green',
      '预备党员': 'tag-yellow',
      '合作中': 'tag-green',
      '已结束': 'tag-gray',
      '洽谈中': 'tag-yellow',
      '学习': 'tag-blue',
      '实践': 'tag-green',
      '志愿服务': 'tag-red',
      '会议': 'tag-purple'
    };
    return classMap[status] || 'tag-gray';
  },

  /**
   * 显示加载状态
   * @param {string} containerId - 容器ID
   */
  showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }
  },

  /**
   * 隐藏加载状态
   * @param {string} containerId - 容器ID
   */
  hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      const loading = container.querySelector('.loading');
      if (loading) loading.remove();
    }
  },

  /**
   * 计算年龄
   * @param {string} birthDate - 出生日期
   * @returns {number} 年龄
   */
  calculateAge(birthDate) {
    if (!birthDate) return null;
    const now = new Date();
    const birth = new Date(birthDate);
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  },

  /**
   * 计算党龄
   * @param {string} joinDate - 入党日期
   * @returns {number} 党龄
   */
  calculatePartyAge(joinDate) {
    if (!joinDate) return null;
    const now = new Date();
    const join = new Date(joinDate);
    let age = now.getFullYear() - join.getFullYear();
    const monthDiff = now.getMonth() - join.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < join.getDate())) {
      age--;
    }
    return age;
  }
};

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  if (typeof App !== 'undefined') {
    App.init();
  }
});

// 导出供全局使用
window.App = App;
