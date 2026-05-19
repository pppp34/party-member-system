/**
 * 数据管理器 - Supabase 云同步版
 * 支持 localStorage 和 Supabase 双模式
 * 自动检测并切换数据源
 */

const DataManagerCloud = {
  // 数据键名（localStorage）
  KEYS: {
    MEMBERS: 'party_members',
    PARTNERS: 'party_partners',
    ACTIVITIES: 'party_activities',
    SETTINGS: 'party_settings',
    MEMBER_BEHAVIOR: 'party_member_behavior',
    SYNC_MODE: 'party_sync_mode',        // localStorage / supabase
    LAST_SYNC: 'party_last_sync'         // 最后同步时间
  },

  // 当前模式
  _mode: 'localStorage',  // 默认本地模式
  _supabase: null,
  _pendingSync: [],      // 待同步操作队列

  /**
   * 初始化
   */
  async init() {
    this._loadMode();
    
    if (this._mode === 'supabase' && isSupabaseConfigured()) {
      this._supabase = getSupabaseClient();
      await this._syncFromCloud();
    } else {
      // 回退到本地模式
      DataManager.initSampleData();
    }
  },

  /**
   * 加载同步模式设置
   */
  _loadMode() {
    const savedMode = localStorage.getItem(this.KEYS.SYNC_MODE);
    if (savedMode) {
      this._mode = savedMode;
    }
  },

  /**
   * 切换同步模式
   */
  async switchMode(mode) {
    if (mode === 'supabase' && !isSupabaseConfigured()) {
      alert('请先配置 Supabase 连接！');
      return false;
    }

    if (mode === 'supabase') {
      this._supabase = getSupabaseClient();
      // 先上传本地数据到云端
      await this._uploadToCloud();
      // 再从云端拉取最新数据
      await this._syncFromCloud();
    } else {
      // 从云端下载数据到本地
      if (isSupabaseConfigured() && this._supabase) {
        await this._downloadFromCloud();
      }
    }

    this._mode = mode;
    localStorage.setItem(this.KEYS.SYNC_MODE, mode);
    localStorage.setItem(this.KEYS.LAST_SYNC, new Date().toISOString());
    
    return true;
  },

  // ============================================
  // 云端同步操作
  // ============================================

  /**
   * 从云端同步数据
   */
  async _syncFromCloud() {
    try {
      // 同步党员数据
      const { data: members, error: mError } = await this._supabase
        .from('members')
        .select('*');
      if (!mError && members) {
        this._convertToLocalFormat(members, 'members');
      }

      // 同步合作伙伴数据
      const { data: partners, error: pError } = await this._supabase
        .from('partners')
        .select('*');
      if (!pError && partners) {
        this._convertToLocalFormat(partners, 'partners');
      }

      // 同步活动数据
      const { data: activities, error: aError } = await this._supabase
        .from('activities')
        .select('*');
      if (!aError && activities) {
        this._convertToLocalFormat(activities, 'activities');
      }

      // 同步行为数据
      const { data: behaviors, error: bError } = await this._supabase
        .from('member_behavior')
        .select('*');
      if (!bError && behaviors) {
        this._convertToLocalFormat(behaviors, 'behaviors');
      }

      localStorage.setItem(this.KEYS.LAST_SYNC, new Date().toISOString());
      console.log('✅ 数据同步成功');
      return true;
    } catch (error) {
      console.error('❌ 同步失败:', error);
      return false;
    }
  },

  /**
   * 上传数据到云端
   */
  async _uploadToCloud() {
    try {
      const members = this.getAllMembers();
      const partners = this.getAllPartners();
      const activities = this.getAllActivities();

      console.log('📤 开始上传数据...');
      console.log('党员数量:', members.length);
      console.log('合作伙伴数量:', partners.length);
      console.log('活动数量:', activities.length);

      // 批量上传党员数据
      if (members.length > 0) {
        const uploadData = members.map(m => this._convertToCloudFormat(m));
        console.log('上传党员数据...', uploadData.length, '条');
        const { data, error } = await this._supabase.from('members').upsert(uploadData);
        if (error) {
          console.error('党员数据上传失败:', error);
          alert('党员数据上传失败: ' + error.message);
        } else {
          console.log('✅ 党员数据上传成功');
        }
      }

      // 批量上传合作伙伴
      if (partners.length > 0) {
        const uploadData = partners.map(p => this._convertToCloudFormat(p));
        const { error } = await this._supabase.from('partners').upsert(uploadData);
        if (error) console.error('合作伙伴上传失败:', error);
        else console.log('✅ 合作伙伴上传成功');
      }

      // 批量上传活动
      if (activities.length > 0) {
        const uploadData = activities.map(a => this._convertToCloudFormat(a));
        const { error } = await this._supabase.from('activities').upsert(uploadData);
        if (error) console.error('活动上传失败:', error);
        else console.log('✅ 活动上传成功');
      }

      console.log('✅ 数据上传完成');
      return true;
    } catch (error) {
      console.error('❌ 上传失败:', error);
      alert('上传失败: ' + error.message);
      return false;
    }
  },

  /**
   * 下载数据到本地
   */
  async _downloadFromCloud() {
    try {
      // 获取云端数据并覆盖本地
      const [membersRes, partnersRes, activitiesRes, behaviorsRes] = await Promise.all([
        this._supabase.from('members').select('*'),
        this._supabase.from('partners').select('*'),
        this._supabase.from('activities').select('*'),
        this._supabase.from('member_behavior').select('*')
      ]);

      if (membersRes.data) {
        this._convertToLocalFormat(membersRes.data, 'members');
      }
      if (partnersRes.data) {
        this._convertToLocalFormat(partnersRes.data, 'partners');
      }
      if (activitiesRes.data) {
        this._convertToLocalFormat(activitiesRes.data, 'activities');
      }
      if (behaviorsRes.data) {
        this._convertToLocalFormat(behaviorsRes.data, 'behaviors');
      }

      return true;
    } catch (error) {
      console.error('❌ 下载失败:', error);
      return false;
    }
  },

  /**
   * 转换为本地格式
   */
  _convertToLocalFormat(cloudData, type) {
    const localData = cloudData.map(item => {
      const converted = { ...item };
      
      // 转换字段名：snake_case → camelCase
      if (converted.id_card) { converted.idCard = converted.id_card; delete converted.id_card; }
      if (converted.birth_date) { converted.birthDate = converted.birth_date; delete converted.birth_date; }
      if (converted.join_date) { converted.joinDate = converted.join_date; delete converted.join_date; }
      if (converted.formal_date) { converted.formalDate = converted.formal_date; delete converted.formal_date; }
      if (converted.contact_person) { converted.contactPerson = converted.contact_person; delete converted.contact_person; }
      if (converted.contact_phone) { converted.contactPhone = converted.contact_phone; delete converted.contact_phone; }
      if (converted.cooperative_projects) { converted.cooperativeProjects = converted.cooperative_projects; delete converted.cooperative_projects; }
      if (converted.cooperation_start) { converted.cooperationStart = converted.cooperation_start; delete converted.cooperation_start; }
      if (converted.cooperation_end) { converted.cooperationEnd = converted.cooperation_end; delete converted.cooperation_end; }
      if (converted.participant_names) { converted.participants = converted.participant_names; delete converted.participant_names; }
      if (converted.created_by) { converted.createdBy = converted.created_by; delete converted.created_by; }
      
      // 删除云端系统字段
      delete converted.created_at;
      delete converted.updated_at;

      return converted;
    });

    switch(type) {
      case 'members':
        localStorage.setItem(this.KEYS.MEMBERS, JSON.stringify(localData));
        break;
      case 'partners':
        localStorage.setItem(this.KEYS.PARTNERS, JSON.stringify(localData));
        break;
      case 'activities':
        localStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify(localData));
        break;
      case 'behaviors':
        // 行为数据需要重新组装
        const behaviorMap = {};
        localData.forEach(b => {
          if (!behaviorMap[b.member_id]) {
            behaviorMap[b.member_id] = { points: 0, notes: [], lifeEvents: [], meetingRecords: [], volunteerRecords: [], specialRecords: [], taskRecords: [], medalRecords: [], activityRecords: [], paymentRecords: [] };
          }
          const record = { id: b.id, type: b.type, title: b.title, content: b.content, date: b.date, createdAt: b.created_at };
          if (b.points) behaviorMap[b.member_id].points += b.points;
          if (b.status) record.status = b.status;
          if (b.level) record.level = b.level;
          if (b.amount) record.amount = b.amount;
          
          // 根据类型归类
          switch(b.type) {
            case '学习历程': behaviorMap[b.member_id].notes.push(record); break;
            case '党员发展': behaviorMap[b.member_id].lifeEvents.push(record); break;
            case '三会一课': behaviorMap[b.member_id].meetingRecords.push(record); break;
            case '志愿者': behaviorMap[b.member_id].volunteerRecords.push(record); break;
            case '我的帮扶': behaviorMap[b.member_id].specialRecords.push(record); break;
            case '我的任务': behaviorMap[b.member_id].taskRecords.push(record); break;
            case '我的勋章': behaviorMap[b.member_id].medalRecords.push(record); break;
            case '我的活动': behaviorMap[b.member_id].activityRecords.push(record); break;
            case '党费缴纳': behaviorMap[b.member_id].paymentRecords.push(record); break;
          }
        });
        localStorage.setItem(this.KEYS.MEMBER_BEHAVIOR, JSON.stringify(behaviorMap));
        break;
    }
  },

  /**
   * 转换为云端格式
   */
  _convertToCloudFormat(localItem) {
    const converted = { ...localItem };
    
    // 转换字段名：camelCase → snake_case
    if (converted.idCard) { converted.id_card = converted.idCard; delete converted.idCard; }
    if (converted.birthDate) { converted.birth_date = converted.birthDate; delete converted.birthDate; }
    if (converted.joinDate) { converted.join_date = converted.joinDate; delete converted.joinDate; }
    if (converted.formalDate) { converted.formal_date = converted.formalDate; delete converted.formalDate; }
    if (converted.contactPerson) { converted.contact_person = converted.contactPerson; delete converted.contactPerson; }
    if (converted.contactPhone) { converted.contact_phone = converted.contactPhone; delete converted.contactPhone; }
    if (converted.cooperativeProjects) { converted.cooperative_projects = converted.cooperativeProjects; delete converted.cooperativeProjects; }
    if (converted.cooperationStart) { converted.cooperation_start = converted.cooperationStart; delete converted.cooperationStart; }
    if (converted.cooperationEnd) { converted.cooperation_end = converted.cooperationEnd; delete converted.cooperationEnd; }
    if (converted.participants) { converted.participant_names = converted.participants; delete converted.participants; }
    if (converted.createdBy) { converted.created_by = converted.createdBy; delete converted.createdBy; }
    
    // 删除本地系统字段
    delete converted.createdAt;
    delete converted.updatedAt;

    return converted;
  },

  // ============================================
  // 数据操作（同时支持本地和云端）
  // ============================================

  /**
   * 保存数据到 localStorage
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
   */
  generateId() {
    return 'pm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // ============================================
  // 党员数据操作
  // ============================================

  getAllMembers() {
    return this.load(this.KEYS.MEMBERS) || [];
  },

  getMemberById(id) {
    const members = this.getAllMembers();
    return members.find(m => m.id === id) || null;
  },

  async addMember(member) {
    const newMember = {
      ...member,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 本地保存
    const members = this.getAllMembers();
    members.push(newMember);
    this.save(this.KEYS.MEMBERS, members);

    // 云端同步
    if (this._mode === 'supabase') {
      const { error } = await this._supabase
        .from('members')
        .insert(this._convertToCloudFormat(newMember));
      if (error) {
        console.error('云端同步失败:', error);
        this._addPendingSync('insert', 'members', newMember);
      }
    }

    return newMember;
  },

  async updateMember(id, data) {
    const members = this.getAllMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    members[index] = {
      ...members[index],
      ...data,
      id: id,
      updatedAt: new Date().toISOString()
    };
    this.save(this.KEYS.MEMBERS, members);

    // 云端同步
    if (this._mode === 'supabase') {
      const { error } = await this._supabase
        .from('members')
        .update(this._convertToCloudFormat(members[index]))
        .eq('id', id);
      if (error) console.error('云端同步失败:', error);
    }

    return true;
  },

  async deleteMember(id) {
    const members = this.getAllMembers();
    const filtered = members.filter(m => m.id !== id);
    this.save(this.KEYS.MEMBERS, filtered);

    // 云端同步
    if (this._mode === 'supabase') {
      const { error } = await this._supabase
        .from('members')
        .delete()
        .eq('id', id);
      if (error) console.error('云端同步失败:', error);
    }

    return true;
  },

  async importMembers(membersData) {
    const members = this.getAllMembers();
    let added = 0, skipped = 0;
    
    for (const item of membersData) {
      const exists = members.some(m => m.idCard === item.idCard);
      if (!exists) {
        const newMember = {
          ...item,
          id: this.generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        members.push(newMember);
        added++;
      } else {
        skipped++;
      }
    }
    
    this.save(this.KEYS.MEMBERS, members);

    // 云端批量同步
    if (this._mode === 'supabase' && added > 0) {
      const newMembers = members.slice(-added);
      const cloudData = newMembers.map(m => this._convertToCloudFormat(m));
      await this._supabase.from('members').insert(cloudData);
    }

    return { added, skipped, total: members.length };
  },

  // ============================================
  // 行为数据操作
  // ============================================

  getMemberBehavior(memberId) {
    const allBehavior = this.load(this.KEYS.MEMBER_BEHAVIOR) || {};
    return allBehavior[memberId] || {
      points: 0,
      notes: [],
      lifeEvents: [],
      meetingRecords: [],
      volunteerRecords: [],
      specialRecords: [],
      taskRecords: [],
      medalRecords: [],
      activityRecords: [],
      paymentRecords: []
    };
  },

  async addMemberTrace(memberId, trace) {
    const behavior = this.getMemberBehavior(memberId);
    const traceRecord = {
      id: this.generateId(),
      ...trace,
      createdAt: new Date().toISOString()
    };

    // 本地保存
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

    // 保存到本地
    const allBehavior = this.load(this.KEYS.MEMBER_BEHAVIOR) || {};
    allBehavior[memberId] = behavior;
    this.save(this.KEYS.MEMBER_BEHAVIOR, allBehavior);

    // 云端同步
    if (this._mode === 'supabase') {
      const cloudRecord = this._convertToCloudFormat({
        member_id: memberId,
        ...traceRecord
      });
      await this._supabase.from('member_behavior').insert(cloudRecord);
    }

    return true;
  },

  // ============================================
  // 合作伙伴操作
  // ============================================

  getAllPartners() {
    return this.load(this.KEYS.PARTNERS) || [];
  },

  async addPartner(partner) {
    const newPartner = {
      ...partner,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const partners = this.getAllPartners();
    partners.push(newPartner);
    this.save(this.KEYS.PARTNERS, partners);

    if (this._mode === 'supabase') {
      await this._supabase.from('partners').insert(this._convertToCloudFormat(newPartner));
    }

    return newPartner;
  },

  async updatePartner(id, data) {
    const partners = this.getAllPartners();
    const index = partners.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    partners[index] = {
      ...partners[index],
      ...data,
      id: id,
      updatedAt: new Date().toISOString()
    };
    this.save(this.KEYS.PARTNERS, partners);

    if (this._mode === 'supabase') {
      await this._supabase.from('partners').update(this._convertToCloudFormat(partners[index])).eq('id', id);
    }

    return true;
  },

  async deletePartner(id) {
    const partners = this.getAllPartners();
    const filtered = partners.filter(p => p.id !== id);
    this.save(this.KEYS.PARTNERS, filtered);

    if (this._mode === 'supabase') {
      await this._supabase.from('partners').delete().eq('id', id);
    }

    return true;
  },

  // ============================================
  // 活动操作
  // ============================================

  getAllActivities() {
    return this.load(this.KEYS.ACTIVITIES) || [];
  },

  async addActivity(activity) {
    const newActivity = {
      ...activity,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    const activities = this.getAllActivities();
    activities.push(newActivity);
    this.save(this.KEYS.ACTIVITIES, activities);

    if (this._mode === 'supabase') {
      await this._supabase.from('activities').insert(this._convertToCloudFormat(newActivity));
    }

    return newActivity;
  },

  async deleteActivity(id) {
    const activities = this.getAllActivities();
    const filtered = activities.filter(a => a.id !== id);
    this.save(this.KEYS.ACTIVITIES, filtered);

    if (this._mode === 'supabase') {
      await this._supabase.from('activities').delete().eq('id', id);
    }

    return true;
  },

  // ============================================
  // 统计计算（本地执行）
  // ============================================

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

  groupBy(data, key) {
    return data.reduce((acc, item) => {
      const value = item[key] || '未知';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  },

  groupByYear(data, key) {
    return data.reduce((acc, item) => {
      if (item[key]) {
        const year = new Date(item[key]).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
      }
      return acc;
    }, {});
  },

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
  // 数据迁移
  // ============================================

  /**
   * 导出本地数据
   */
  exportData() {
    return {
      members: this.getAllMembers(),
      partners: this.getAllPartners(),
      activities: this.getAllActivities(),
      behaviors: this.load(this.KEYS.MEMBER_BEHAVIOR),
      exportedAt: new Date().toISOString()
    };
  },

  /**
   * 导入数据
   */
  async importData(data) {
    if (data.members) {
      this.save(this.KEYS.MEMBERS, data.members);
    }
    if (data.partners) {
      this.save(this.KEYS.PARTNERS, data.partners);
    }
    if (data.activities) {
      this.save(this.KEYS.ACTIVITIES, data.activities);
    }
    if (data.behaviors) {
      this.save(this.KEYS.MEMBER_BEHAVIOR, data.behaviors);
    }

    // 如果是云端模式，同步上传
    if (this._mode === 'supabase') {
      await this._uploadToCloud();
    }

    return true;
  },

  /**
   * 从旧系统迁移
   */
  async migrateFromLocalStorage() {
    const data = DataManager.exportData();
    return await this.importData(data);
  },

  // ============================================
  // 初始化（保留原始示例数据）
  // ============================================

  initSampleData() {
    DataManager.initSampleData();
  }
};

// 兼容旧接口
DataManagerCloud.initSampleData = DataManager.initSampleData;

// 导出供全局使用
window.DataManagerCloud = DataManagerCloud;
