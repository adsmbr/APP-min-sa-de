/**
 * Script para limpar cache e forçar recarregamento do perfil
 * Execute este script no console do navegador (F12 > Console)
 */

console.log("🧹 Iniciando limpeza de cache e dados do usuário...");

// 1. Limpar localStorage
console.log("📦 Limpando localStorage...");
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (
    key.includes('supabase') || 
    key.includes('auth') || 
    key.includes('profile') ||
    key.includes('user') ||
    key.includes('role')
  )) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  console.log(`🗑️ Removendo: ${key}`);
  localStorage.removeItem(key);
});

// 2. Limpar sessionStorage
console.log("📋 Limpando sessionStorage...");
const sessionKeysToRemove = [];
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  if (key && (
    key.includes('supabase') || 
    key.includes('auth') || 
    key.includes('profile') ||
    key.includes('user') ||
    key.includes('role')
  )) {
    sessionKeysToRemove.push(key);
  }
}

sessionKeysToRemove.forEach(key => {
  console.log(`🗑️ Removendo sessão: ${key}`);
  sessionStorage.removeItem(key);
});

// 3. Forçar logout e login novamente
console.log("🚪 Forçando logout...");

// Se o Supabase estiver disponível globalmente
if (window.supabase) {
  window.supabase.auth.signOut().then(() => {
    console.log("✅ Logout realizado com sucesso!");
    console.log("🔄 Por favor, faça login novamente para atualizar o perfil.");
  });
} else {
  console.log("⚠️ Supabase não encontrado globalmente. Faça logout manualmente.");
}

// 4. Limpar cache do navegador (apenas para dados da aplicação)
if ('caches' in window) {
  console.log("🗂️ Limpando cache do service worker...");
  caches.keys().then(names => {
    names.forEach(name => {
      console.log(`🗑️ Removendo cache: ${name}`);
      caches.delete(name);
    });
  });
}

console.log("✅ Limpeza concluída!");
console.log("🔄 Recarregue a página e faça login novamente.");
console.log("📝 Instruções:");
console.log("   1. Pressione Ctrl+F5 (ou Cmd+Shift+R no Mac) para recarregar");
console.log("   2. Faça login novamente");
console.log("   3. Verifique se o role de administrador está funcionando");