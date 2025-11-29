## Diagnóstico
- Espaços nos inputs: ao digitar, o espaço entre palavras é removido porque `sanitizarString` aplica `trim()` em cada `onChange`, apagando o espaço recém-digitado (efeito de “não consigo dar espaço”). Onde ocorre: `src/components/FormularioRegistro.jsx:180-187` usa `sanitizarString(valorProcessado)`; a função tem `trim()` em `src/utils/validacao.js:291-294`.
- Deslogando após inatividade: a sessão depende do auto‑refresh do Supabase (ativo) e da inicialização da sessão. Em erros de rede/timeouts, o provider entra em modo offline e não revalida até voltar online. Ponto crítico: inicialização com poucos retries e sem tratar `visibilitychange`. Locais: cliente com `autoRefreshToken/persistSession` em `src/lib/supabase.js:13-19`; fluxo de sessão/listener em `src/components/auth/AuthProvider.jsx:61-132` e `183-224`.
- Logout travando: fluxo limpa estado antes do `signOut` e depende do listener para confirmar; se o `signOut` falhar em rede, pode haver estado inconsistente e “carregando” indevidamente. Local: `src/components/auth/AuthProvider.jsx:316-350`; botão chama `onLogout` via `src/components/Layout.jsx:111-120`.

## Plano de Correção
1) Permitir espaços enquanto digita
- Remover `trim()` de `sanitizarString` e aplicar `trim()` apenas em validação/envio.
- Alternativa mínima: não aplicar `sanitizarString` em campos que precisam de espaços (`localidade`, além de `endereco` e `tutor`).
- Validar que os checks já usam `.trim()` (ex.: `validarObrigatorio`, `validarLocalidade`, etc.).

2) Estabilizar sessão para evitar “deslogar” por inatividade
- Aumentar resiliência de `initializeAuth`: subir `maxRetries` e melhorar backoff.
- Revalidar sessão quando a aba volta a foco (`document.visibilitychange`): chamar `supabase.auth.getSession()` e atualizar `user/session`.
- Manter comportamento atual de `onAuthStateChange` para `TOKEN_REFRESHED` e `SIGNED_OUT`.

3) Tornar logout confiável
- Usar `supabase.auth.signOut()` direto e aguardar evento `SIGNED_OUT` antes de finalizar loading.
- Em falha de rede, garantir fallback visual (estado limpo já existe), e não bloquear em loading.
- Opcional: limpar o storage de sessão apenas se o `signOut` continuar falhando (último recurso).

## Verificação
- Inputs: testar digitação com espaços em `localidade`, `tutor` e `endereco` — os espaços devem permanecer enquanto digita e a validação ainda passar ao submeter.
- Sessão: simular aba em segundo plano e retorno de foco, confirmar que o usuário permanece logado e o token é renovado (`TOKEN_REFRESHED`).
- Logout: acionar “Sair” online e em rede instável, confirmar retorno à tela de login sem travar.

Confirma que posso aplicar essas alterações? Após confirmar, implemento e rodo uma verificação rápida em desenvolvimento.