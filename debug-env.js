// Script para debugar variáveis de ambiente
console.log("🔍 DEBUG: Verificando variáveis de ambiente...");

console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);

console.log("Todas as variáveis VITE_:", Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

console.log("import.meta.env completo:", import.meta.env);