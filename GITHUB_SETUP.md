# 🚀 Configuração do GitHub

## 📋 **Passos para Subir o Projeto:**

### 1. **Criar Repositório no GitHub**
- Acesse [github.com](https://github.com)
- Clique em **"New repository"**
- Nome: `genius-game` (ou o nome que preferir)
- Descrição: `🎮 Sistema de Jogo Interativo com ESP32`
- Público ou Privado (sua escolha)
- **NÃO** inicialize com README, .gitignore ou LICENSE (já temos)
- Clique em **"Create repository"**

### 2. **Conectar Repositório Local ao Remoto**
```bash
# Substitua "SEU_USUARIO" pelo seu nome de usuário no GitHub
git remote add origin https://github.com/SEU_USUARIO/genius-game.git

# Verificar se foi adicionado
git remote -v
```

### 3. **Fazer Push para o GitHub**
```bash
# Primeiro push (estabelece a branch main como upstream)
git push -u origin main

# Próximos pushes (apenas)
git push
```

### 4. **Verificar no GitHub**
- Acesse seu repositório
- Todos os arquivos devem estar lá
- O README.md será exibido na página principal

## 🔧 **Comandos Úteis:**

```bash
# Ver status
git status

# Ver histórico de commits
git log --oneline

# Ver branches
git branch -a

# Ver repositórios remotos
git remote -v
```

## 📁 **Estrutura Final do Projeto:**

```
genius-game/
├── 📄 README.md              # Documentação principal
├── 📄 LICENSE                # Licença MIT
├── 📄 .gitignore             # Arquivos ignorados pelo Git
├── 🌐 index.html             # Interface principal
├── 🎮 script.js              # Lógica do jogo
├── 🎨 styles.css             # Estilos e temas
├── 🔌 udp_bridge.py          # Servidor ponte
├── 📁 esp32_relay_control/   # Código Arduino
│   └── 📄 esp32_relay_control.ino
└── 📄 genius.xyz             # Arquivo solicitado
```

## 🎯 **Próximos Passos:**

1. **Criar repositório** no GitHub
2. **Executar comandos** de conexão
3. **Fazer push** do código
4. **Compartilhar** o link do repositório

## 🆘 **Se Houver Problemas:**

- **Erro de autenticação**: Configure suas credenciais do GitHub
- **Branch não encontrada**: Verifique se está na branch `main`
- **Conflitos**: Use `git pull origin main` antes de fazer push

---

**🎮 Seu projeto está pronto para o GitHub! 🎮**
