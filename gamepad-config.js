class GamepadConfigurator {
    constructor() {
        this.gamepad = null;
        this.gamepadPollingInterval = null;
        this.gamepadButtonStates = [];
        this.mapping = {};
        this.currentMappingButton = null;
        this.isMapping = false;
        this.mappingTimeout = null;
        
        this.debugLog('🔧 Configurador de Gamepad inicializado', 'info');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.detectGamepad();
        this.loadExistingMapping();
        this.startGamepadPolling();
        
        this.debugLog('✅ Sistema inicializado com sucesso', 'success');
    }
    
    bindEvents() {
        // Botões do jogo
        document.querySelectorAll('.game-button').forEach(button => {
            button.addEventListener('click', () => {
                const colorNumber = parseInt(button.dataset.color);
                const colorName = button.dataset.name;
                this.startMapping(colorNumber, colorName);
            });
        });
        
        // Botões de controle
        document.getElementById('testBtn').addEventListener('click', () => {
            this.testMapping();
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveMapping();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetMapping();
        });
        
        // Detectar conexão/desconexão de gamepad
        window.addEventListener('gamepadconnected', (e) => {
            this.debugLog(`🎮 Gamepad conectado: ${e.gamepad.id}`, 'success');
            this.gamepad = e.gamepad;
            this.updateGamepadStatus();
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            this.debugLog(`🎮 Gamepad desconectado: ${e.gamepad.id}`, 'warning');
            this.gamepad = null;
            this.updateGamepadStatus();
        });
    }
    
    detectGamepad() {
        const gamepads = navigator.getGamepads();
        if (gamepads[0]) {
            this.gamepad = gamepads[0];
            this.debugLog(`🎮 Gamepad detectado: ${this.gamepad.id}`, 'success');
            this.debugLog(`🎮 Botões disponíveis: ${this.gamepad.buttons.length}`, 'info');
        } else {
            this.debugLog('🎮 Nenhum gamepad detectado', 'warning');
        }
        this.updateGamepadStatus();
    }
    
    startGamepadPolling() {
        if (this.gamepadPollingInterval) return;
        
        this.gamepadPollingInterval = setInterval(() => {
            this.pollGamepad();
        }, 50); // 20 FPS para responsividade
        
        this.debugLog('🔄 Polling do gamepad iniciado', 'info');
    }
    
    pollGamepad() {
        if (!this.gamepad) return;
        
        // Atualizar referência do gamepad
        const gamepads = navigator.getGamepads();
        this.gamepad = gamepads[this.gamepad.index] || null;
        
        if (!this.gamepad) return;
        
        // Inicializar array de estados se necessário
        if (this.gamepadButtonStates.length === 0) {
            this.gamepadButtonStates = new Array(this.gamepad.buttons.length).fill(false);
        }
        
        // Verificar botões pressionados
        for (let i = 0; i < this.gamepad.buttons.length; i++) {
            const button = this.gamepad.buttons[i];
            const isPressed = button && button.pressed;
            const wasPressed = this.gamepadButtonStates[i];
            
            // Detectar pressionamento (edge-triggered)
            if (isPressed && !wasPressed) {
                this.gamepadButtonStates[i] = true;
                this.handleGamepadButtonPress(i);
            } else if (!isPressed && wasPressed) {
                this.gamepadButtonStates[i] = false;
            }
        }
    }
    
    handleGamepadButtonPress(gamepadButtonIndex) {
        this.debugLog(`🎮 Botão ${gamepadButtonIndex} pressionado no gamepad`, 'info');
        
        if (this.isMapping && this.currentMappingButton) {
            // Verificar se este botão já foi mapeado
            const alreadyMapped = Object.values(this.mapping).includes(gamepadButtonIndex);
            if (alreadyMapped) {
                this.showStatus(`❌ Botão ${gamepadButtonIndex} já foi mapeado! Use outro botão.`, 'error');
                this.debugLog(`❌ Tentativa de mapear botão ${gamepadButtonIndex} que já está em uso`, 'error');
                return;
            }
            
            // Mapear botão
            this.mapping[this.currentMappingButton] = gamepadButtonIndex;
            this.updateButtonDisplay(this.currentMappingButton);
            this.showStatus(`✅ ${this.getColorName(this.currentMappingButton)} mapeado para botão ${gamepadButtonIndex}`, 'success');
            this.debugLog(`✅ ${this.getColorName(this.currentMappingButton)} (${this.currentMappingButton}) → Gamepad botão ${gamepadButtonIndex}`, 'success');
            
            // Parar mapeamento
            this.stopMapping();
            
            // Verificar se todos os botões foram mapeados
            if (Object.keys(this.mapping).length === 6) {
                this.showStatus('🎉 Todos os botões foram mapeados! Você pode testar e salvar.', 'success');
                this.debugLog('🎉 Mapeamento completo - todos os 6 botões configurados', 'success');
                document.getElementById('testBtn').disabled = false;
                document.getElementById('saveBtn').disabled = false;
            }
        } else {
            this.debugLog(`🎮 Botão ${gamepadButtonIndex} pressionado (não em modo de mapeamento)`, 'info');
        }
    }
    
    startMapping(colorNumber, colorName) {
        if (!this.gamepad) {
            this.showStatus('❌ Nenhum gamepad detectado! Conecte um gamepad primeiro.', 'error');
            this.debugLog('❌ Tentativa de mapear sem gamepad conectado', 'error');
            return;
        }
        
        this.currentMappingButton = colorNumber;
        this.isMapping = true;
        
        // Atualizar UI
        document.querySelectorAll('.game-button').forEach(btn => {
            btn.classList.remove('mapping');
        });
        
        const buttonElement = document.querySelector(`[data-color="${colorNumber}"]`);
        buttonElement.classList.add('mapping');
        
        this.showStatus(`🎯 Mapeando ${colorName}... Pressione um botão no seu gamepad`, 'info');
        this.debugLog(`🎯 Iniciando mapeamento para ${colorName} (${colorNumber})`, 'info');
        
        // Timeout para cancelar mapeamento
        this.mappingTimeout = setTimeout(() => {
            this.stopMapping();
            this.showStatus('⏰ Tempo esgotado. Clique no botão novamente para tentar.', 'warning');
            this.debugLog('⏰ Timeout no mapeamento', 'warning');
        }, 10000); // 10 segundos
    }
    
    stopMapping() {
        this.isMapping = false;
        this.currentMappingButton = null;
        
        // Remover classe de mapeamento
        document.querySelectorAll('.game-button').forEach(btn => {
            btn.classList.remove('mapping');
        });
        
        // Limpar timeout
        if (this.mappingTimeout) {
            clearTimeout(this.mappingTimeout);
            this.mappingTimeout = null;
        }
    }
    
    updateButtonDisplay(colorNumber) {
        const buttonElement = document.querySelector(`[data-color="${colorNumber}"]`);
        const mappedInfo = document.getElementById(`mapped-${colorNumber}`);
        
        if (this.mapping[colorNumber] !== undefined) {
            const gamepadButton = this.mapping[colorNumber];
            mappedInfo.textContent = `Mapeado: Botão ${gamepadButton}`;
            mappedInfo.classList.add('mapped');
            buttonElement.classList.add('mapped');
            buttonElement.classList.remove('mapping');
        } else {
            mappedInfo.textContent = 'Não mapeado';
            mappedInfo.classList.remove('mapped');
            buttonElement.classList.remove('mapped');
        }
    }
    
    updateGamepadStatus() {
        const statusElement = document.getElementById('gamepadStatus');
        const statusText = document.getElementById('gamepadStatusText');
        
        if (this.gamepad) {
            statusElement.className = 'gamepad-status connected';
            statusText.textContent = `Conectado: ${this.gamepad.id}`;
        } else {
            statusElement.className = 'gamepad-status disconnected';
            statusText.textContent = 'Nenhum gamepad detectado';
        }
    }
    
    testMapping() {
        if (Object.keys(this.mapping).length !== 6) {
            this.showStatus('❌ Mapeie todos os 6 botões antes de testar!', 'error');
            this.debugLog('❌ Tentativa de testar mapeamento incompleto', 'error');
            return;
        }
        
        this.showStatus('🧪 Modo de teste ativado! Pressione os botões do gamepad para testar.', 'info');
        this.debugLog('🧪 Iniciando teste do mapeamento', 'info');
        
        // Temporariamente ativar modo de teste
        this.isTestMode = true;
        
        // Mostrar mapeamento atual
        let mappingText = 'Mapeamento atual:\n';
        for (let color = 1; color <= 6; color++) {
            const colorName = this.getColorName(color);
            const gamepadButton = this.mapping[color];
            mappingText += `${colorName} → Botão ${gamepadButton}\n`;
        }
        this.debugLog(mappingText, 'info');
        
        // Desativar modo de teste após 10 segundos
        setTimeout(() => {
            this.isTestMode = false;
            this.showStatus('✅ Teste finalizado. Salve a configuração se estiver correta.', 'success');
            this.debugLog('✅ Teste do mapeamento finalizado', 'success');
        }, 10000);
    }
    
    saveMapping() {
        if (Object.keys(this.mapping).length !== 6) {
            this.showStatus('❌ Mapeie todos os 6 botões antes de salvar!', 'error');
            this.debugLog('❌ Tentativa de salvar mapeamento incompleto', 'error');
            return;
        }
        
        try {
            localStorage.setItem('gamepadMapping', JSON.stringify(this.mapping));
            this.showStatus('✅ Configuração salva com sucesso! Você pode voltar ao jogo.', 'success');
            this.debugLog('✅ Mapeamento salvo no localStorage', 'success');
            this.debugLog(`📦 Dados salvos: ${JSON.stringify(this.mapping)}`, 'info');
            
            // Mostrar resumo final
            let summary = 'Resumo da configuração salva:\n';
            for (let color = 1; color <= 6; color++) {
                const colorName = this.getColorName(color);
                const gamepadButton = this.mapping[color];
                summary += `${colorName} (${color}) → Gamepad botão ${gamepadButton}\n`;
            }
            this.debugLog(summary, 'success');
            
        } catch (error) {
            this.showStatus('❌ Erro ao salvar configuração!', 'error');
            this.debugLog(`❌ Erro ao salvar: ${error.message}`, 'error');
        }
    }
    
    resetMapping() {
        this.mapping = {};
        this.stopMapping();
        
        // Atualizar display
        for (let color = 1; color <= 6; color++) {
            this.updateButtonDisplay(color);
        }
        
        this.showStatus('🔄 Configuração resetada. Comece novamente.', 'info');
        this.debugLog('🔄 Mapeamento resetado', 'info');
        
        document.getElementById('testBtn').disabled = true;
        document.getElementById('saveBtn').disabled = true;
    }
    
    loadExistingMapping() {
        try {
            const saved = localStorage.getItem('gamepadMapping');
            if (saved) {
                this.mapping = JSON.parse(saved);
                this.debugLog('📦 Mapeamento existente carregado', 'info');
                this.debugLog(`📦 Dados carregados: ${JSON.stringify(this.mapping)}`, 'info');
                
                // Atualizar display
                for (let color = 1; color <= 6; color++) {
                    this.updateButtonDisplay(color);
                }
                
                // Habilitar botões se mapeamento completo
                if (Object.keys(this.mapping).length === 6) {
                    document.getElementById('testBtn').disabled = false;
                    document.getElementById('saveBtn').disabled = false;
                    this.showStatus('✅ Configuração anterior carregada. Você pode testar ou salvar novamente.', 'success');
                } else {
                    this.showStatus('⚠️ Configuração parcial carregada. Complete o mapeamento.', 'warning');
                }
            } else {
                this.debugLog('📦 Nenhum mapeamento anterior encontrado', 'info');
            }
        } catch (error) {
            this.debugLog(`❌ Erro ao carregar mapeamento: ${error.message}`, 'error');
        }
    }
    
    getColorName(colorNumber) {
        const names = {
            1: 'Vermelho',
            2: 'Branco',
            3: 'Âmbar',
            4: 'Azul',
            5: 'Amarelo',
            6: 'Verde'
        };
        return names[colorNumber] || 'Desconhecido';
    }
    
    showStatus(message, type) {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';
        
        // Auto-esconder após 5 segundos
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
    
    debugLog(message, type = 'info') {
        const debugContainer = document.getElementById('debugLogs');
        const logElement = document.createElement('div');
        logElement.className = `debug-log ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logElement.textContent = `[${timestamp}] ${message}`;
        
        debugContainer.appendChild(logElement);
        
        // Manter apenas os últimos 50 logs
        while (debugContainer.children.length > 50) {
            debugContainer.removeChild(debugContainer.firstChild);
        }
        
        // Scroll para o final
        debugContainer.scrollTop = debugContainer.scrollHeight;
        
        // Também logar no console do navegador
        console.log(`[GamepadConfig] ${message}`);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.gamepadConfigurator = new GamepadConfigurator();
});
