-- =============================================
-- 党员管理系统 - Supabase 数据库设计
-- =============================================

-- 1. 党员信息表
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 基本信息
  name VARCHAR(50) NOT NULL,
  gender VARCHAR(10),
  id_card VARCHAR(20) UNIQUE,
  phone VARCHAR(20),
  email VARCHAR(100),
  birth_date DATE,
  nation VARCHAR(20),
  education VARCHAR(20),
  -- 组织信息
  position VARCHAR(50),
  party_position VARCHAR(50),
  branch VARCHAR(100),
  join_date DATE,
  formal_date DATE,
  type VARCHAR(20),          -- 正式党员/预备党员
  status VARCHAR(20),       -- 正常/流动/失联
  residence VARCHAR(200),
  work_unit VARCHAR(200),
  tags TEXT[],               -- PostgreSQL 数组类型
  remark TEXT,
  -- 系统字段
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 合作伙伴表
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50),           -- 政府/高校/企业/社区
  level VARCHAR(50),          -- 部级/省级/市级/区级
  contact_person VARCHAR(50),
  contact_phone VARCHAR(50),
  address VARCHAR(300),
  cooperative_projects TEXT[],
  cooperation_start DATE,
  cooperation_end DATE,
  status VARCHAR(20),         -- 合作中/已结束/洽谈中
  remark TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 活动表
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  type VARCHAR(50),           -- 学习/实践/志愿服务/会议
  date DATE,
  location VARCHAR(200),
  participants UUID[],
  participant_names TEXT[],
  content TEXT,
  outcomes TEXT,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 党员行为记录表
CREATE TABLE member_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,  -- points/notes/life_events/meetings/volunteer/special/tasks/medals/activities/payments
  title VARCHAR(200),
  content TEXT,
  date DATE,
  -- 扩展字段
  points INTEGER DEFAULT 0,
  status VARCHAR(20),
  level VARCHAR(50),
  amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RLS 行级安全策略（Row Level Security）
-- =============================================

-- 启用 RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_behavior ENABLE ROW LEVEL SECURITY;

-- 公开读取（任何人可查看）
CREATE POLICY "Allow public read members" ON members FOR SELECT USING (true);
CREATE POLICY "Allow public read partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Allow public read activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Allow public read behavior" ON member_behavior FOR SELECT USING (true);

-- 允许插入
CREATE POLICY "Allow insert members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert partners" ON partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert activities" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert behavior" ON member_behavior FOR INSERT WITH CHECK (true);

-- 允许更新
CREATE POLICY "Allow update members" ON members FOR UPDATE USING (true);
CREATE POLICY "Allow update partners" ON partners FOR UPDATE USING (true);
CREATE POLICY "Allow update activities" ON activities FOR UPDATE USING (true);
CREATE POLICY "Allow update behavior" ON member_behavior FOR UPDATE USING (true);

-- 允许删除
CREATE POLICY "Allow delete members" ON members FOR DELETE USING (true);
CREATE POLICY "Allow delete partners" ON partners FOR DELETE USING (true);
CREATE POLICY "Allow delete activities" ON activities FOR DELETE USING (true);
CREATE POLICY "Allow delete behavior" ON member_behavior FOR DELETE USING (true);

-- =============================================
-- 索引优化
-- =============================================

CREATE INDEX idx_members_branch ON members(branch);
CREATE INDEX idx_members_type ON members(type);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_behavior_member_id ON member_behavior(member_id);
CREATE INDEX idx_behavior_type ON member_behavior(type);

-- =============================================
-- 自动更新时间戳触发器
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
