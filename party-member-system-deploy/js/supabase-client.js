/**
 * Supabase 客户端配置
 * 使用前请先在 Supabase 控制台创建项目并获取以下信息：
 * 1. Project URL
 * 2. anon/public key
 * 
 * 获取地址：Supabase 控制台 → Settings → API
 */

const SUPABASE_CONFIG = {
  // 乡村振兴学院党员管理系统
  url: 'https://xrrkwnqlzhuavloltxmj.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhycmt3bnFsemh1YXZsb2x0eG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjk2OTYsImV4cCI6MjA5NDc0NTY5Nn0.qACjO8czea7v7A77b6CYK4Gf4LFvj08dJn5YopBO3lE'
};

/**
 * 初始化 Supabase 客户端
 * 使用懒加载模式，在首次使用时才初始化
 */
let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    // 动态加载 Supabase SDK
    if (typeof window.supabase !== 'undefined') {
      supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
      );
    } else {
      console.error('Supabase SDK 未加载，请确保引入了 @supabase/supabase-js');
      return null;
    }
  }
  return supabaseClient;
}

/**
 * 检查是否已配置 Supabase
 */
function isSupabaseConfigured() {
  return SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_PROJECT_URL' &&
         SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY';
}
