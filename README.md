# 🎮 Genius Game - Sistema de Jogo Interativo com ESP32

Um jogo de memória interativo que combina uma interface web moderna com controle de hardware via ESP32 e relés.

## ✨ Características

- **🎯 Jogo de Memória**: Sequências crescentes de botões para memorizar
- **🎮 Suporte a Gamepad**: Compatível com controles USB/Bluetooth
- **🔌 Integração ESP32**: Controle de 6 relés via comunicação serial
- **🌐 Interface Web**: Interface responsiva e moderna
- **📊 Sistema de Relatórios**: Histórico completo de partidas
- **🎨 Temas Personalizáveis**: Múltiplos temas visuais
- **⚙️ Configurações Flexíveis**: Tempo de inatividade, cores, sons
- **📈 Estatísticas**: Recordes e métricas de performance

## 🚀 Como Usar

### 1. **Iniciar o Jogo**
- Pressione qualquer tecla ou botão do gamepad
- Use os botões 1-6 do gamepad para iniciar
- Botão Start (9) também funciona como alternativa

### 2. **Atalhos de Teclado**
- **F1** → Configurações (temas, tempo, som, UDP)
- **F2** → Relatório de partidas
- **F3** → Relatório (atalho alternativo)
- **ESC** → Fechar modais

### 3. **Jogabilidade**
- Memorize a sequência de botões
- Repita a sequência corretamente
- Cada nível adiciona um botão à sequência
- Game over se errar ou ficar inativo

## 🔧 Configuração

### **Requisitos do Sistema**
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Python 3.7+ (para servidor ponte)
- ESP32 com firmware compatível

### **Instalação**

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/genius-game.git
   cd genius-game
   ```

2. **Inicie o servidor ponte**
   ```bash
   python3 udp_bridge.py
   ```

3. **Abra o jogo**
   - Abra `index.html` no navegador
   - Ou use um servidor local: `python3 -m http.server 8000`

### **Configuração ESP32**
- Carregue o código Arduino em `esp32_relay_control/`
- Conecte 6 relés aos pinos configurados
- Configure a comunicação serial

## 📁 Estrutura do Projeto

```
genius-game/
├── index.html          # Interface principal do jogo
├── script.js           # Lógica do jogo e gamepad
├── styles.css          # Estilos e temas
├── udp_bridge.py       # Servidor ponte UDP
├── esp32_relay_control/ # Código Arduino para ESP32
├── genius.xyz          # Arquivo de configuração
└── README.md           # Esta documentação
```

## 🎯 Funcionalidades Técnicas

### **Comunicação**
- **HTTP → UDP**: Servidor ponte Python
- **Serial**: Comunicação com ESP32
- **Gamepad API**: Suporte nativo a controles

### **Persistência**
- **LocalStorage**: Configurações e histórico
- **Sessão**: Estado do jogo atual
- **Exportação**: Relatórios em CSV

### **Interface**
- **Responsiva**: Adaptável a diferentes telas
- **Modais**: Configurações e relatórios
- **Animações**: Efeitos visuais e confetti
- **Temas**: Múltiplas paletas de cores

## 🔌 Configuração de Rede

### **UDP Bridge**
- **Porta padrão**: 3000
- **Host**: 127.0.0.1 (configurável)
- **Protocolo**: HTTP → UDP

### **ESP32**
- **Pinos de relé**: 4, 16, 17, 5, 18, 19
- **Comunicação**: Serial (115200 baud)
- **Comandos**: 2 dígitos (XY: X=relé 1-6, Y=ação 0/1)

## 📊 Sistema de Relatórios

- **Histórico completo** de todas as partidas
- **Estatísticas** de performance
- **Exportação CSV** para análise
- **Relatórios visuais** para apresentações
- **Filtros** por data e pontuação

## 🎨 Personalização

### **Temas Disponíveis**
- **Default**: Tema clássico
- **Dark**: Modo escuro
- **Neon**: Cores vibrantes
- **Pastel**: Tons suaves

### **Configurações**
- **Tempo de inatividade**: 1-30 segundos
- **Volume de som**: 0-100%
- **Host UDP**: Configurável
- **Nomes dos botões**: Personalizáveis

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- **Issues**: Use o sistema de issues do GitHub
- **Documentação**: Consulte este README
- **ESP32**: Verifique o código Arduino em `esp32_relay_control/`

## 🏆 Créditos

Desenvolvido para eventos interativos e apresentações profissionais.

---

**🎮 Divirta-se jogando! 🎮**
