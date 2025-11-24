# Firebase Studio

This is a Next.js starter in Firebase Studio with a customized landing experience for the Finanças Zen interface.

## Visual preview

1) Instale as dependências se ainda não tiver feito:
   ```bash
   npm install
   ```
2) Rode o servidor local (Turbopack):
   ```bash
   npm run dev -- --hostname 0.0.0.0 --port 3000
   ```
3) Acesse http://localhost:3000 para visualizar a home com o carrossel hero, CTA de demonstração e chips de status destacados.

Os destaques de layout estão em `src/app/page.tsx` (seção hero e cartões “Acessos Rápidos”).

## Como conectar ao GitHub e enviar commits

Caso o repositório ainda não tenha remoto configurado, defina-o (substitua pelo URL do seu repositório):
```bash
git remote add origin https://github.com/<usuario>/<repo>.git
```

Confirme os remotos disponíveis:
```bash
git remote -v
```

Envie a branch atual (por exemplo, `work`) para o GitHub:
```bash
git push -u origin work
```
Depois disso, use `git push` para enviar commits futuros.
