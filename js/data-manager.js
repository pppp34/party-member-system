/**
 * 数据管理模块
 * 负责 localStorage 数据持久化操作
 */

const DataManager = {
  // 数据键名
  KEYS: {
    MEMBERS: 'party_members',
    PARTNERS: 'party_partners',
    ACTIVITIES: 'party_activities',
    SETTINGS: 'party_settings',
    MEMBER_BEHAVIOR: 'party_member_behavior'
  },

  /**
   * 保存数据到 localStorage
   * @param {string} key - 存储键名
   * @param {any} data - 要存储的数据
   */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('数据保存失败:', e);
      return false;
    }
  },

  /**
   * 从 localStorage 读取数据
   * @param {string} key - 存储键名
   * @returns {any} 解析后的数据
   */
  load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('数据读取失败:', e);
      return null;
    }
  },

  /**
   * 生成唯一ID
   * @returns {string} UUID格式的ID
   */
  generateId() {
    return 'pm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // ============================================
  // 党员数据操作
  // ============================================

  /**
   * 获取所有党员
   * @returns {Array} 党员列表
   */
  getAllMembers() {
    return this.load(this.KEYS.MEMBERS) || [];
  },

  /**
   * 根据ID获取党员
   * @param {string} id - 党员ID
   * @returns {Object|null} 党员对象
   */
  getMemberById(id) {
    const members = this.getAllMembers();
    return members.find(m => m.id === id) || null;
  },

  /**
   * 添加党员
   * @param {Object} member - 党员数据
   * @returns {boolean} 是否成功
   */
  addMember(member) {
    const members = this.getAllMembers();
    const newMember = {
      ...member,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    members.push(newMember);
    return this.save(this.KEYS.MEMBERS, members);
  },

  /**
   * 更新党员信息
   * @param {string} id - 党员ID
   * @param {Object} data - 更新数据
   * @returns {boolean} 是否成功
   */
  updateMember(id, data) {
    const members = this.getAllMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    members[index] = {
      ...members[index],
      ...data,
      id: id,
      updatedAt: new Date().toISOString()
    };
    return this.save(this.KEYS.MEMBERS, members);
  },

  /**
   * 删除党员
   * @param {string} id - 党员ID
   * @returns {boolean} 是否成功
   */
  deleteMember(id) {
    const members = this.getAllMembers();
    const filtered = members.filter(m => m.id !== id);
    return this.save(this.KEYS.MEMBERS, filtered);
  },

  /**
   * 批量导入党员
   * @param {Array} membersData - 党员数据数组
   * @returns {Object} 导入结果
   */
  importMembers(membersData) {
    const members = this.getAllMembers();
    let added = 0, skipped = 0;
    
    membersData.forEach(item => {
      // 检查是否已存在（根据身份证号）
      const exists = members.some(m => m.idCard === item.idCard);
      if (!exists) {
        members.push({
          ...item,
          id: this.generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        added++;
      } else {
        skipped++;
      }
    });
    
    this.save(this.KEYS.MEMBERS, members);
    return { added, skipped, total: members.length };
  },

  // ============================================
  // 党员行为数据操作
  // ============================================

  /**
   * 获取党员行为数据
   * @param {string} memberId - 党员ID
   * @returns {Object} 行为数据
   */
  getMemberBehavior(memberId) {
    const allBehavior = this.load(this.KEYS.MEMBER_BEHAVIOR) || {};
    return allBehavior[memberId] || {
      points: 0,
      notes: [],
      lifeEvents: [],
      meetingRecords: [],
      volunteerRecords: [],
      specialRecords: [],
      paymentRecords: [],
      taskRecords: [],
      medalRecords: [],
      activityRecords: []
    };
  },

  /**
   * 保存党员行为数据
   * @param {string} memberId - 党员ID
   * @param {Object} data - 行为数据
   * @returns {boolean} 是否成功
   */
  saveMemberBehavior(memberId, data) {
    const allBehavior = this.load(this.KEYS.MEMBER_BEHAVIOR) || {};
    allBehavior[memberId] = { ...this.getMemberBehavior(memberId), ...data };
    return this.save(this.KEYS.MEMBER_BEHAVIOR, allBehavior);
  },

  /**
   * 添加党员生活轨迹
   * @param {string} memberId - 党员ID
   * @param {Object} trace - 轨迹记录 {type, title, date, content}
   * @returns {boolean} 是否成功
   */
  addMemberTrace(memberId, trace) {
    const behavior = this.getMemberBehavior(memberId);
    const traceRecord = {
      id: this.generateId(),
      ...trace,
      createdAt: new Date().toISOString()
    };

    // 根据类型归类
    switch (trace.type) {
      case '党员发展': behavior.lifeEvents.push(traceRecord); break;
      case '学习历程': behavior.notes.push(traceRecord); break;
      case '三会一课': behavior.meetingRecords.push(traceRecord); break;
      case '志愿者': behavior.volunteerRecords.push(traceRecord); break;
      case '我的帮扶': behavior.specialRecords.push(traceRecord); break;
      case '我的任务': behavior.taskRecords.push(traceRecord); break;
      case '积分': behavior.points += trace.points || 0; break;
      case '我的勋章': behavior.medalRecords.push(traceRecord); break;
      case '我的活动': behavior.activityRecords.push(traceRecord); break;
      case '党费缴纳': behavior.paymentRecords.push(traceRecord); break;
      default: behavior.lifeEvents.push(traceRecord);
    }

    return this.saveMemberBehavior(memberId, behavior);
  },

  // ============================================
  // 合作伙伴数据操作
  // ============================================

  /**
   * 获取所有合作伙伴
   * @returns {Array} 合作伙伴列表
   */
  getAllPartners() {
    return this.load(this.KEYS.PARTNERS) || [];
  },

  /**
   * 添加合作伙伴
   * @param {Object} partner - 合作伙伴数据
   * @returns {boolean} 是否成功
   */
  addPartner(partner) {
    const partners = this.getAllPartners();
    const newPartner = {
      ...partner,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    partners.push(newPartner);
    return this.save(this.KEYS.PARTNERS, partners);
  },

  /**
   * 更新合作伙伴
   * @param {string} id - 合作伙伴ID
   * @param {Object} data - 更新数据
   * @returns {boolean} 是否成功
   */
  updatePartner(id, data) {
    const partners = this.getAllPartners();
    const index = partners.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    partners[index] = {
      ...partners[index],
      ...data,
      id: id,
      updatedAt: new Date().toISOString()
    };
    return this.save(this.KEYS.PARTNERS, partners);
  },

  /**
   * 删除合作伙伴
   * @param {string} id - 合作伙伴ID
   * @returns {boolean} 是否成功
   */
  deletePartner(id) {
    const partners = this.getAllPartners();
    const filtered = partners.filter(p => p.id !== id);
    return this.save(this.KEYS.PARTNERS, filtered);
  },

  // ============================================
  // 活动数据操作
  // ============================================

  /**
   * 获取所有活动
   * @returns {Array} 活动列表
   */
  getAllActivities() {
    return this.load(this.KEYS.ACTIVITIES) || [];
  },

  /**
   * 添加活动
   * @param {Object} activity - 活动数据
   * @returns {boolean} 是否成功
   */
  addActivity(activity) {
    const activities = this.getAllActivities();
    const newActivity = {
      ...activity,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    activities.push(newActivity);
    return this.save(this.KEYS.ACTIVITIES, activities);
  },

  /**
   * 删除活动
   * @param {string} id - 活动ID
   * @returns {boolean} 是否成功
   */
  deleteActivity(id) {
    const activities = this.getAllActivities();
    const filtered = activities.filter(a => a.id !== id);
    return this.save(this.KEYS.ACTIVITIES, filtered);
  },

  // ============================================
  // 统计计算
  // ============================================

  /**
   * 计算党员统计信息
   * @returns {Object} 统计结果
   */
  getMemberStats() {
    const members = this.getAllMembers();
    const now = new Date();
    
    return {
      total: members.length,
      formal: members.filter(m => m.type === '正式党员').length,
      probationary: members.filter(m => m.type === '预备党员').length,
      active: members.filter(m => m.status === '正常').length,
      mobile: members.filter(m => m.status === '流动').length,
      inactive: members.filter(m => m.status === '失联').length,
      male: members.filter(m => m.gender === '男').length,
      female: members.filter(m => m.gender === '女').length,
      byEducation: this.groupBy(members, 'education'),
      byBranch: this.groupBy(members, 'branch'),
      byJoinYear: this.groupByYear(members, 'joinDate'),
      ageDistribution: this.getAgeDistribution(members)
    };
  },

  /**
   * 计算合作伙伴统计
   * @returns {Object} 统计结果
   */
  getPartnerStats() {
    const partners = this.getAllPartners();
    return {
      total: partners.length,
      active: partners.filter(p => p.status === '合作中').length,
      ended: partners.filter(p => p.status === '已结束').length,
      negotiating: partners.filter(p => p.status === '洽谈中').length,
      byType: this.groupBy(partners, 'type'),
      byLevel: this.groupBy(partners, 'level')
    };
  },

  /**
   * 分组统计
   * @param {Array} data - 数据数组
   * @param {string} key - 分组键名
   * @returns {Object} 分组结果
   */
  groupBy(data, key) {
    return data.reduce((acc, item) => {
      const value = item[key] || '未知';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  },

  /**
   * 按年份分组
   * @param {Array} data - 数据数组
   * @param {string} key - 日期键名
   * @returns {Object} 按年份分组结果
   */
  groupByYear(data, key) {
    return data.reduce((acc, item) => {
      if (item[key]) {
        const year = new Date(item[key]).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
      }
      return acc;
    }, {});
  },

  /**
   * 计算年龄分布
   * @param {Array} members - 党员列表
   * @returns {Object} 年龄分布
   */
  getAgeDistribution(members) {
    const now = new Date();
    const distribution = {
      '25岁以下': 0,
      '26-35岁': 0,
      '36-45岁': 0,
      '46-55岁': 0,
      '56岁以上': 0
    };
    
    members.forEach(m => {
      if (m.birthDate) {
        const age = Math.floor((now - new Date(m.birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 26) distribution['25岁以下']++;
        else if (age <= 35) distribution['26-35岁']++;
        else if (age <= 45) distribution['36-45岁']++;
        else if (age <= 55) distribution['46-55岁']++;
        else distribution['56岁以上']++;
      }
    });
    
    return distribution;
  },

  // ============================================
  // 数据初始化
  // ============================================

  /**
   * 初始化示例数据
   */
  initSampleData() {
    // 检查是否已有完整数据（含id和行为数据）
    const members = this.getAllMembers();
    if (members.length > 0 && members[0].id && this.load(this.KEYS.MEMBER_BEHAVIOR)) return;

    // 党员示例数据
    const sampleMembers = [
      {
        name: '张明',
        gender: '男',
        idCard: '320102199001011234',
        phone: '13812345601',
        email: 'zhangming@example.com',
        birthDate: '1990-01-01',
        nation: '汉族',
        education: '本科',
        position: '系主任',
        partyPosition: '支部书记',
        branch: '现代农业系党支部',
        joinDate: '2012-06-15',
        formalDate: '2013-06-15',
        type: '正式党员',
        status: '正常',
        residence: '南京市栖霞区',
        workUnit: '江苏开放大学乡村振兴学院',
        tags: ['干部', '优秀党员'],
        remark: ''
      },
      {
        name: '李华',
        gender: '女',
        idCard: '320102199203021234',
        phone: '13812345602',
        email: 'lihua@example.com',
        birthDate: '1992-03-02',
        nation: '汉族',
        education: '硕士',
        position: '副教授',
        partyPosition: '组织委员',
        branch: '社会化服务系党支部',
        joinDate: '2014-12-01',
        formalDate: '2015-12-01',
        type: '正式党员',
        status: '正常',
        residence: '南京市鼓楼区',
        workUnit: '江苏开放大学乡村振兴学院',
        tags: ['教学骨干'],
        remark: ''
      },
      {
        name: '王建国',
        gender: '男',
        idCard: '320102198505031234',
        phone: '13812345603',
        email: 'wangjianguo@example.com',
        birthDate: '1985-05-03',
        nation: '汉族',
        education: '博士',
        position: '教授',
        partyPosition: '纪委委员',
        branch: '学院党委',
        joinDate: '2008-07-01',
        formalDate: '2009-07-01',
        type: '正式党员',
        status: '正常',
        residence: '南京市玄武区',
        workUnit: '江苏开放大学乡村振兴学院',
        tags: ['学术带头人'],
        remark: ''
      },
      {
        name: '赵敏',
        gender: '女',
        idCard: '320102199508041234',
        phone: '13812345604',
        email: 'zhaomin@example.com',
        birthDate: '1995-08-04',
        nation: '汉族',
        education: '本科',
        position: '讲师',
        partyPosition: '宣传委员',
        branch: '现代农业系党支部',
        joinDate: '2019-06-20',
        formalDate: '2020-06-20',
        type: '正式党员',
        status: '正常',
        residence: '南京市江宁区',
        workUnit: '江苏开放大学乡村振兴学院',
        tags: ['青年骨干'],
        remark: ''
      },
      {
        name: '陈志强',
        gender: '男',
        idCard: '320102199211051234',
        phone: '13812345605',
        email: 'chenzhiqiang@example.com',
        birthDate: '1992-11-05',
        nation: '汉族',
        education: '硕士',
        position: '助教',
        partyPosition: '',
        branch: '社会化服务系党支部',
        joinDate: '2020-09-15',
        formalDate: '',
        type: '预备党员',
        status: '正常',
        residence: '南京市秦淮区',
        workUnit: '江苏开放大学乡村振兴学院',
        tags: ['新党员'],
        remark: '预备期至2021年9月'
      },
      {
        name: '刘芳',
        gender: '女',
        idCard: '320102198812061234',
        phone: '13812345606',
        email: 'liufang@example.com',
        birthDate: '1988-12-06',
        nation: '汉族',
        education: '本科',
        position: '办公室副主任',
        partyPosition: '统战委员',
        branch: '学院办公室党支部',
        joinDate: '2011-03-10',
        formalDate: '2012-03-10',
        type: '正式党员',
        status: '正常',
        residence: '南京市浦口区',
        workUnit: '江苏开放大学乡村振兴学院',
        tags: ['行政骨干'],
        remark: ''
      },
      {
        name: '周伟',
        gender: '男',
        idCard: '320102199607071234',
        phone: '13912345607',
        email: 'zhouwei@example.com',
        birthDate: '1996-07-07',
        nation: '汉族',
        education: '本科',
        position: '辅导员',
        partyPosition: '',
        branch: '新农人研培中心党支部',
        joinDate: '2021-07-01',
        formalDate: '2022-07-01',
        type: '正式党员',
        status: '流动',
        residence: '苏州市吴中区',
        workUnit: '江苏开放大学乡村振兴学院',
        tags: ['流动党员'],
        remark: '因工作调动至苏州'
      },
      {
        name: '吴静',
        gender: '女',
        idCard: '320102199403081234',
        phone: '13812345608',
        email: 'wujing@example.com',
        birthDate: '1994-03-08',
        nation: '汉族',
        education: '硕士',
        position: '讲师',
        partyPosition: '青年委员',
        branch: '现代农业系党支部',
        joinDate: '2017-12-20',
        formalDate: '2018-12-20',
        type: '正式党员',
        status: '正常',
        residence: '南京市建邺区',
        workUnit: '江苏开放大学乡村振兴学院',
        tags: ['青年骨干'],
        remark: ''
      }
    ];

    // 合作伙伴示例数据
    const samplePartners = [
      {
        name: '江苏省农业科学院',
        type: '政府',
        level: '省级',
        contactPerson: '张研究员',
        contactPhone: '025-12345678',
        address: '南京市孝陵卫钟灵街50号',
        cooperativeProjects: ['智慧农业技术研发', '新品种推广'],
        cooperationStart: '2022-01-01',
        cooperationEnd: '2025-12-31',
        status: '合作中',
        remark: '长期战略合作伙伴'
      },
      {
        name: '南京农业大学',
        type: '高校',
        level: '部级',
        contactPerson: '李教授',
        contactPhone: '025-87654321',
        address: '南京市卫岗1号',
        cooperativeProjects: ['人才培养', '科研合作', '学术交流'],
        cooperationStart: '2021-03-15',
        cooperationEnd: '2026-03-14',
        status: '合作中',
        remark: '联合培养研究生'
      },
      {
        name: '江苏苏宁农业集团',
        type: '企业',
        level: '省级',
        contactPerson: '王经理',
        contactPhone: '025-98765432',
        address: '南京市玄武大道699号',
        cooperativeProjects: ['学生实习实训', '产学研合作'],
        cooperationStart: '2023-06-01',
        cooperationEnd: '2025-06-01',
        status: '合作中',
        remark: '校外实习基地'
      },
      {
        name: '栖霞区八卦洲街道',
        type: '社区',
        level: '区级',
        contactPerson: '陈主任',
        contactPhone: '025-65432198',
        address: '南京市栖霞区八卦洲街道',
        cooperativeProjects: ['乡村振兴实践', '党员志愿服务'],
        cooperationStart: '2022-09-01',
        cooperationEnd: '',
        status: '合作中',
        remark: '党建共建单位'
      },
      {
        name: '江苏省教育厅',
        type: '政府',
        level: '省级',
        contactPerson: '赵处长',
        contactPhone: '025-11111111',
        address: '南京市北京西路15号',
        cooperativeProjects: ['新农人培训项目'],
        cooperationStart: '2023-01-01',
        cooperationEnd: '2024-12-31',
        status: '已结束',
        remark: '项目已完成'
      }
    ];

    // 活动示例数据
    const sampleActivities = [
      {
        title: '学习贯彻党的二十大精神专题党课',
        type: '学习',
        date: '2024-01-15',
        location: '学院会议室',
        participants: ['张明', '李华', '王建国', '赵敏', '刘芳', '吴静'],
        content: '组织全体党员学习党的二十大精神，邀请校党委书记作专题辅导',
        outcomes: '全体党员深刻领会了二十大精神的核心要义',
        createdBy: '张明'
      },
      {
        title: '赴八卦洲开展乡村振兴调研实践活动',
        type: '实践',
        date: '2024-03-20',
        location: '栖霞区八卦洲街道',
        participants: ['张明', '李华', '赵敏', '陈志强', '周伟'],
        content: '深入了解当地农业发展现状，走访农户，调研产业发展需求',
        outcomes: '形成调研报告1份，建立实践基地1个',
        createdBy: '李华'
      },
      {
        title: '\"学雷锋\"志愿服务活动',
        type: '志愿服务',
        date: '2024-03-05',
        location: '学院周边社区',
        participants: ['赵敏', '陈志强', '周伟', '吴静'],
        content: '开展社区环境整治、关爱老人等志愿服务',
        outcomes: '服务社区居民50余人次',
        createdBy: '赵敏'
      },
      {
        title: '党员民主评议会',
        type: '会议',
        date: '2024-01-25',
        location: '学院会议室',
        participants: ['张明', '李华', '王建国', '赵敏', '刘芳', '陈志强', '周伟', '吴静'],
        content: '开展2023年度党员民主评议',
        outcomes: '评选优秀党员3名',
        createdBy: '张明'
      }
    ];

    // 保存示例数据 - 给成员数据添加id和系统字段
    const membersWithId = sampleMembers.map(m => ({
      ...m,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    this.save(this.KEYS.MEMBERS, membersWithId);
    this.save(this.KEYS.PARTNERS, samplePartners);
    this.save(this.KEYS.ACTIVITIES, sampleActivities);

    // 为第一个成员添加示例行为数据（党员画像演示用）
    if (membersWithId.length > 0) {
      const firstId = membersWithId[0].id;
      this.save(this.KEYS.MEMBER_BEHAVIOR, {
        [firstId]: {
          points: 56,
          notes: [
            { id: this.generateId(), type: '学习历程', title: '学习党的二十大精神', date: '2024-01-15', content: '参加支部组织的党的二十大精神学习会议，认真学习了党的二十大报告全文，撰写了学习心得体会。', createdAt: '2024-01-15T09:00:00Z' },
            { id: this.generateId(), type: '学习历程', title: '学习新党章', date: '2024-02-20', content: '系统学习了新修订的《中国共产党章程》，对新修订内容进行了深入理解。', createdAt: '2024-02-20T10:00:00Z' },
            { id: this.generateId(), type: '学习历程', title: '习近平新时代中国特色社会主义思想专题学习', date: '2024-03-10', content: '参加"学思想、强党性、重实践、建新功"主题教育专题学习。', createdAt: '2024-03-10T14:00:00Z' },
            { id: this.generateId(), type: '学习历程', title: '党史学习教育', date: '2024-04-05', content: '学习中国共产党百年奋斗史，撰写党史学习心得一篇。', createdAt: '2024-04-05T09:30:00Z' },
            { id: this.generateId(), type: '学习历程', title: '党纪学习教育', date: '2024-05-15', content: '学习《中国共产党纪律处分条例》，增强纪律意识和规矩意识。', createdAt: '2024-05-15T15:00:00Z' },
            { id: this.generateId(), type: '学习历程', title: '乡村振兴政策学习', date: '2024-06-01', content: '学习中央一号文件关于全面推进乡村振兴的决策部署。', createdAt: '2024-06-01T10:00:00Z' },
            { id: this.generateId(), type: '学习历程', title: '农业科技创新专题', date: '2024-06-20', content: '学习现代农业科技发展趋势，了解智慧农业技术应用。', createdAt: '2024-06-20T14:00:00Z' },
            { id: this.generateId(), type: '学习历程', title: '基层党建工作方法', date: '2024-07-10', content: '学习新时代基层党建工作的创新方法和实践经验。', createdAt: '2024-07-10T09:00:00Z' },
            { id: this.generateId(), type: '学习历程', title: '生态文明建设', date: '2024-08-05', content: '学习习近平生态文明思想，了解绿色发展理念。', createdAt: '2024-08-05T10:30:00Z' }
          ],
          lifeEvents: [
            { id: this.generateId(), type: '党员发展', title: '成为预备党员', date: '2012-06-15', content: '经过党支部大会讨论通过，成为中国共产党预备党员。', createdAt: '2012-06-15T00:00:00Z' },
            { id: this.generateId(), type: '党员发展', title: '转为正式党员', date: '2013-06-15', content: '经过一年的预备期考察，经支部大会讨论通过，转为中国共产党正式党员。', createdAt: '2013-06-15T00:00:00Z' },
            { id: this.generateId(), type: '党员发展', title: '任命为支部书记', date: '2020-09-01', content: '经上级党委批准，任命为现代农业系党支部书记。', createdAt: '2020-09-01T00:00:00Z' }
          ],
          meetingRecords: [
            { id: this.generateId(), type: '三会一课', title: '支部党员大会', date: '2024-01-10', content: '参加支部党员大会，讨论年度工作计划和党员发展事宜。', createdAt: '2024-01-10T14:00:00Z' },
            { id: this.generateId(), type: '三会一课', title: '主题党日活动', date: '2024-02-28', content: '参加"学党史、悟思想"主题党日活动。', createdAt: '2024-02-28T09:00:00Z' },
            { id: this.generateId(), type: '三会一课', title: '党课学习', date: '2024-03-15', content: '参加支部书记讲党课活动，学习习近平新时代中国特色社会主义思想。', createdAt: '2024-03-15T14:30:00Z' },
            { id: this.generateId(), type: '三会一课', title: '组织生活会', date: '2024-04-20', content: '开展批评与自我批评，总结一季度工作。', createdAt: '2024-04-20T14:00:00Z' },
            { id: this.generateId(), type: '三会一课', title: '支部委员会', date: '2024-05-25', content: '讨论支部近期工作安排和党员发展计划。', createdAt: '2024-05-25T10:00:00Z' }
          ],
          volunteerRecords: [
            { id: this.generateId(), type: '志愿者', title: '社区志愿服务', date: '2024-03-05', content: '参加"学雷锋"志愿服务活动，为社区居民提供政策咨询服务。', createdAt: '2024-03-05T09:00:00Z' },
            { id: this.generateId(), type: '志愿者', title: '乡村振兴帮扶', date: '2024-03-20', content: '赴八卦洲街道开展乡村振兴调研，为当地农户提供技术指导。', createdAt: '2024-03-20T08:00:00Z' },
            { id: this.generateId(), type: '志愿者', title: '助农直播带货', date: '2024-06-15', content: '参与学院组织的助农直播活动，帮助推广当地农产品。', createdAt: '2024-06-15T19:00:00Z' },
            { id: this.generateId(), type: '志愿者', title: '乡村环境整治', date: '2024-07-20', content: '参加乡村环境美化志愿活动，清理乡村公共区域。', createdAt: '2024-07-20T08:00:00Z' },
            { id: this.generateId(), type: '志愿者', title: '关爱留守儿童', date: '2024-08-25', content: '赴农村小学开展关爱留守儿童志愿服务活动。', createdAt: '2024-08-25T09:00:00Z' }
          ],
          specialRecords: [
            { id: this.generateId(), type: '我的帮扶', title: '帮扶困难党员', date: '2024-02-01', content: '对支部困难党员开展帮扶工作，协助解决生活和工作中的实际困难。', createdAt: '2024-02-01T10:00:00Z' },
            { id: this.generateId(), type: '我的帮扶', title: '结对帮扶农户', date: '2024-05-10', content: '与八卦洲街道2户困难农户建立结对帮扶关系，提供农业技术指导。', createdAt: '2024-05-10T10:00:00Z' },
            { id: this.generateId(), type: '我的帮扶', title: '帮扶情况回访', date: '2024-08-01', content: '对帮扶农户进行回访，了解帮扶效果，调整帮扶措施。', createdAt: '2024-08-01T10:00:00Z' },
            { id: this.generateId(), type: '我的帮扶', title: '困难党员慰问', date: '2024-09-10', content: '中秋节前慰问支部困难党员，送去组织的关怀和温暖。', createdAt: '2024-09-10T09:00:00Z' },
            { id: this.generateId(), type: '我的帮扶', title: '帮扶计划制定', date: '2024-01-15', content: '制定年度党员帮扶计划，明确帮扶对象和措施。', createdAt: '2024-01-15T10:00:00Z' }
          ],
          taskRecords: [
            { id: this.generateId(), type: '我的任务', title: '完成年度考核任务', date: '2024-01-31', content: '按时完成年度党员民主评议和个人年度工作总结。', status: '已完成', createdAt: '2024-01-31T16:00:00Z' },
            { id: this.generateId(), type: '我的任务', title: '提交学习心得', date: '2024-02-15', content: '提交党的二十大精神学习心得体会一篇。', status: '已完成', createdAt: '2024-02-15T11:00:00Z' },
            { id: this.generateId(), type: '我的任务', title: '参加组织生活会', date: '2024-03-25', content: '准备组织生活会发言材料，开展批评与自我批评。', status: '已完成', createdAt: '2024-03-25T09:00:00Z' },
            { id: this.generateId(), type: '我的任务', title: '支部主题党日活动策划', date: '2024-04-10', content: '策划"清明祭英烈"主题党日活动方案。', status: '已完成', createdAt: '2024-04-10T10:00:00Z' },
            { id: this.generateId(), type: '我的任务', title: '党员发展材料审核', date: '2024-06-01', content: '审核2名预备党员转正材料。', status: '已完成', createdAt: '2024-06-01T14:00:00Z' }
          ],
          medalRecords: [
            { id: this.generateId(), type: '我的勋章', title: '优秀共产党员', date: '2023-07-01', content: '获评2022-2023年度优秀共产党员称号。', level: '校级', createdAt: '2023-07-01T00:00:00Z' },
            { id: this.generateId(), type: '我的勋章', title: '学习标兵', date: '2023-12-31', content: '在年度学习积分评比中获得"学习标兵"称号。', level: '支部', createdAt: '2023-12-31T00:00:00Z' },
            { id: this.generateId(), type: '我的勋章', title: '志愿服务先锋', date: '2024-03-31', content: '在学雷锋志愿服务活动中表现突出，获得表彰。', level: '学院', createdAt: '2024-03-31T00:00:00Z' }
          ],
          activityRecords: [
            { id: this.generateId(), type: '我的活动', title: '学习贯彻党的二十大精神专题党课', date: '2024-01-15', content: '参加学院组织的党的二十大精神专题党课学习活动。', createdAt: '2024-01-15T09:00:00Z' },
            { id: this.generateId(), type: '我的活动', title: '赴八卦洲开展乡村振兴调研实践活动', date: '2024-03-20', content: '参加乡村振兴调研实践活动，深入基层了解实际情况。', createdAt: '2024-03-20T08:00:00Z' },
            { id: this.generateId(), type: '我的活动', title: '"学雷锋"志愿服务活动', date: '2024-03-05', content: '参加社区环境整治、关爱老人等志愿服务。', createdAt: '2024-03-05T09:00:00Z' },
            { id: this.generateId(), type: '我的活动', title: '党员民主评议会', date: '2024-01-25', content: '参加2023年度党员民主评议。', createdAt: '2024-01-25T14:00:00Z' },
            { id: this.generateId(), type: '我的活动', title: '"七一"庆祝活动', date: '2024-07-01', content: '参加学院组织的"七一"建党节庆祝活动。', createdAt: '2024-07-01T09:00:00Z' }
          ],
          paymentRecords: [
            { id: this.generateId(), type: '党费缴纳', title: '2024年第一季度党费', date: '2024-03-31', amount: 36, content: '按时缴纳2024年第一季度党费。', createdAt: '2024-03-31T10:00:00Z' },
            { id: this.generateId(), type: '党费缴纳', title: '2024年第二季度党费', date: '2024-06-30', amount: 36, content: '按时缴纳2024年第二季度党费。', createdAt: '2024-06-30T10:00:00Z' },
            { id: this.generateId(), type: '党费缴纳', title: '2024年第三季度党费', date: '2024-09-30', amount: 36, content: '按时缴纳2024年第三季度党费。', createdAt: '2024-09-30T10:00:00Z' }
          ]
        }
      });
    }
  }
};

// 导出供全局使用
window.DataManager = DataManager;
