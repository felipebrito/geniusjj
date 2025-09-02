class GeniusGame {
    constructor() {
        this.sequence = [];
        this.playerSequence = [];
        this.score = 0;
        this.record = parseInt(localStorage.getItem('geniusRecord')) || 0;
        this.level = 1;
        this.isPlaying = false;
        this.isShowingSequence = false;
        this.currentIndex = 0;
        this.speed = 800;
        this.sequenceLength = 0;
        this.gameOver = false;
        this.readyForRestart = false;
        
        // Gamepad
        this.gamepad = null;
        this.gamepadPollingInterval = null;
        this.gamepadButtonStates = {};
        
        // UDP Communication
        this.udpSocket = null;
        this.wsSocket = null;
        this.udpPort = 3000; // Porta do servidor ponte
        this.udpHost = '127.0.0.1'; // Localhost por padrão
        
        // Configurações
        this.config = this.loadConfig();
        this.inactivityTime = this.config.inactivityTime || 5;
        this.volume = this.config.volume || 30;
        this.soundEnabled = this.config.soundEnabled !== false;
        this.theme = this.config.theme || 'default';
        
        // Histórico de partidas
        this.gameHistory = this.loadGameHistory();
        this.gameStartTime = null;
        
        console.log('Recorde carregado do localStorage:', this.record);
        console.log('localStorage atual:', localStorage.getItem('geniusRecord'));
        
        this.initializeElements();
        this.bindEvents();
        this.audioContext = null;
        this.initAudio();
        this.bindKeyboardEvents();
        this.initUDPConnection();
        this.bindShortcuts();
        this.updateSliderValues();
        this.applyTheme();
        
        // Inicializar campo UDP
        const udpHostInput = document.getElementById('udpHost');
        if (udpHostInput) {
            udpHostInput.value = this.udpHost;
        }
        
        // Testar localStorage
        this.testLocalStorage();
    }
    
    initUDPConnection() {
        // Sem servidor necessário - apenas logs para copiar
        console.log('🔌 Sistema de comunicação configurado');
        console.log('🔌 Host configurado:', this.udpHost);
        console.log('🔌 Porta configurada:', this.udpPort);
        console.log('🔌 Dados serão exibidos no console para copiar');
        this.udpSocket = null;
    }
    
    sendSequenceToUDP(sequence, level, score) {
        const data = {
            type: 'genius_sequence',
            sequence: sequence,
            level: level,
            score: score,
            timestamp: Date.now(),
            action: 'sequence_start'
        };
        
        console.log('📤 === SEQUÊNCIA INICIADA ===');
        console.log('📤 Dados para copiar:', JSON.stringify(data, null, 2));
        console.log('📤 Para implementar no seu software Aparato');
        console.log('📤 ================================');
        
        // Enviar para localhost:8888
        this.sendToLocalhost(data);
    }
    
    sendButtonPressToUDP(buttonIndex, isCorrect) {
        const data = {
            type: 'genius_button_press',
            buttonIndex: buttonIndex,
            isCorrect: isCorrect,
            timestamp: Date.now(),
            action: 'button_press'
        };
        
        console.log('📤 === BOTÃO PRESSIONADO ===');
        console.log('📤 Dados para copiar:', JSON.stringify(data, null, 2));
        console.log('📤 Para implementar no seu software Aparato');
        console.log('📤 ================================');
        
        // Enviar para localhost:8888
        this.sendToLocalhost(data);
    }
    
    sendGameOverToUDP(finalScore, isNewRecord) {
        const data = {
            type: 'genius_game_over',
            finalScore: finalScore,
            isNewRecord: isNewRecord,
            timestamp: Date.now(),
            action: 'game_over'
        };
        
        console.log('📤 === GAME OVER ===');
        console.log('📤 Dados para copiar:', JSON.stringify(data, null, 2));
        console.log('📤 Para implementar no seu software Aparato');
        console.log('📤 ================================');
        
        // Enviar para localhost:8888
        this.sendToLocalhost(data);
    }
    
    sendButtonActivationToUDP(buttonIndex, position, totalLength) {
        const data = {
            type: `btn_sync:${buttonIndex}`,
            buttonIndex: buttonIndex,
            position: position,
            totalLength: totalLength,
            timestamp: Date.now(),
            action: 'button_activation'
        };
        
        console.log('🎵 === BOTÃO SINCRONIZADO ===');
        console.log('🎵 Botão:', buttonIndex, '| Posição:', position + 1, '/', totalLength);
        console.log('🎵 Dados UDP:', JSON.stringify(data, null, 2));
        console.log('🎵 ================================');
        
        // Enviar para localhost:8888
        this.sendToLocalhost(data);
    }
    
    sendToLocalhost(data) {
        const url = `http://${this.udpHost}:${this.udpPort}`;
        
        console.log('📤 Tentando enviar para:', url);
        
        // Método 1: Fetch POST
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(response => {
            console.log('✅ Dados enviados com sucesso via HTTP:', response.status);
        }).catch(error => {
            console.log('❌ HTTP falhou, tentando WebSocket:', error.message);
            this.tryWebSocket(data);
        });
    }
    
    tryWebSocket(data) {
        try {
            if (!this.wsSocket || this.wsSocket.readyState !== WebSocket.OPEN) {
                this.wsSocket = new WebSocket(`ws://${this.udpHost}:${this.udpPort}`);
                
                this.wsSocket.onopen = () => {
                    console.log('🔌 WebSocket conectado, enviando dados...');
                    this.wsSocket.send(JSON.stringify(data));
                };
                
                this.wsSocket.onmessage = (event) => {
                    console.log('📨 Resposta recebida:', event.data);
                };
                
                this.wsSocket.onerror = (error) => {
                    console.log('❌ WebSocket falhou:', error);
                    this.tryUDPFallback(data);
                };
                
                this.wsSocket.onclose = () => {
                    console.log('🔌 WebSocket fechado');
                };
            } else {
                this.wsSocket.send(JSON.stringify(data));
                console.log('✅ Dados enviados via WebSocket existente');
            }
        } catch (error) {
            console.log('❌ WebSocket não disponível:', error);
            this.tryUDPFallback(data);
        }
    }
    
    tryUDPFallback(data) {
        // Método 3: Tentar enviar via UDP usando diferentes abordagens
        console.log('🔄 Tentando métodos alternativos...');
        
        // Método 3.1: XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `http://${this.udpHost}:${this.udpPort}`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log('✅ Dados enviados via XMLHttpRequest');
                } else {
                    console.log('❌ XMLHttpRequest falhou:', xhr.status);
                    this.logDataForManualCopy(data);
                }
            }
        };
        xhr.onerror = () => {
            console.log('❌ XMLHttpRequest com erro');
            this.logDataForManualCopy(data);
        };
        xhr.send(JSON.stringify(data));
    }
    
    logDataForManualCopy(data) {
        console.log('📋 ==========================================');
        console.log('📋 DADOS PARA COPIAR MANUALMENTE:');
        console.log('📋 ==========================================');
        console.log('📋 URL:', `http://${this.udpHost}:${this.udpPort}`);
        console.log('📋 Método: POST');
        console.log('📋 Headers: Content-Type: application/json');
        console.log('📋 Body:', JSON.stringify(data, null, 2));
        console.log('📋 ==========================================');
        console.log('📋 Use curl, Postman ou seu software para enviar');
        console.log('📋 ==========================================');
    }
    
    updateUDPHost() {
        const hostInput = document.getElementById('udpHost');
        const newHost = hostInput.value.trim();
        
        if (newHost) {
            this.udpHost = newHost;
            console.log('🔌 Host de comunicação atualizado para:', this.udpHost);
            console.log('🔌 Porta configurada:', this.udpPort);
            
            // Atualizar display
            const currentHostSpan = document.getElementById('currentHost');
            if (currentHostSpan) {
                currentHostSpan.textContent = this.udpHost;
            }
        }
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.recordElement = document.getElementById('record');
        this.levelElement = document.getElementById('level');
        this.statusElement = document.getElementById('statusText');
        this.buttons = document.querySelectorAll('.game-button');
        this.confettiContainer = document.getElementById('confettiContainer');
        this.gameStatus = document.querySelector('.game-status');
    }
    
    bindEvents() {
        this.buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
                console.log(`Botão ${index} clicado!`);
                this.handleButtonClick(index);
            });
            // Garantir que os botões estejam clicáveis no início
            button.style.pointerEvents = 'auto';
        });
        
        console.log('Eventos vinculados aos botões:', this.buttons.length);
        
        // Inicializar suporte para gamepad
        this.initGamepad();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API não suportada');
        }
    }
    
    playSound(frequency, duration = 200) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }
    
    startGame() {
        console.log('startGame chamado!');
        if (this.isPlaying) {
            console.log('Já está jogando, retornando...');
            return;
        }
        
        // Limpar timer de inatividade se existir
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        // Registrar início do jogo
        this.gameStartTime = Date.now();
        
        this.isPlaying = true;
        this.gameOver = false;
        this.readyForRestart = false;
        
        console.log('Escondendo modal...');
        // Esconder o modal de status
        this.gameStatus.style.display = 'none';
        
        // Limpar sequência anterior e começar do nível 1
        this.sequence = [];
        this.level = 1;
        this.sequenceLength = 0;
        
        console.log('Iniciando sequência em 1 segundo...');
        setTimeout(() => {
            this.generateSequence();
            // Pequeno delay para o Aparato processar a sequência
            setTimeout(() => {
                this.showSequence();
            }, 200);
        }, 1000);
    }
    
    generateSequence() {
        // Se for o primeiro nível, criar uma nova sequência
        if (this.level === 1) {
            this.sequence = [];
        }
        
        // Adicionar apenas UMA nova nota à sequência existente
        const newNote = Math.floor(Math.random() * 6);
        this.sequence.push(newNote);
        this.sequenceLength = this.sequence.length;
        
        console.log(`Nível ${this.level}: Sequência atual:`, this.sequence);
        
        // Enviar sequência para UDP ANTES de mostrar visualmente
        this.sendSequenceToUDP(this.sequence, this.level, this.score);
    }
    
    async showSequence() {
        this.isShowingSequence = true;
        this.statusElement.textContent = `Memorize a sequência de ${this.sequenceLength} botões!`;
        
        // Pausa antes de mostrar a sequência
        await this.sleep(500);
        
        for (let i = 0; i < this.sequence.length; i++) {
            const buttonIndex = this.sequence[i];
            const button = this.buttons[buttonIndex];
            
            // Enviar dados UDP ANTES de ativar o botão
            this.sendButtonActivationToUDP(buttonIndex, i, this.sequence.length);
            
            // Ativar botão com animação
            button.classList.add('active');
            this.playSound(parseInt(button.dataset.sound));
            
            // Manter ativo por um tempo
            await this.sleep(this.speed);
            
            // Desativar botão
            button.classList.remove('active');
            
            // Pausa entre botões
            if (i < this.sequence.length - 1) {
                await this.sleep(300);
            }
        }
        
        this.isShowingSequence = false;
        this.statusElement.textContent = `Sua vez! Repita a sequência de ${this.sequenceLength} botões!`;
        this.enablePlayerInput();
    }
    
    enablePlayerInput() {
        this.playerSequence = [];
        this.currentIndex = 0;
        
        this.buttons.forEach(button => {
            button.style.pointerEvents = 'auto';
        });
        
        // Timer de inatividade - configurável
        this.inactivityTimer = setTimeout(() => {
            if (this.isPlaying && !this.isShowingSequence) {
                console.log('⏰ Timer de inatividade expirado - Game Over!');
                this.statusElement.textContent = '⏰ Tempo esgotado! Game Over por inatividade!';
                this.endGame();
            }
        }, this.inactivityTime * 1000); // Usar tempo configurável
    }
    
    handleButtonClick(buttonIndex) {
        // Sempre permitir cliques nos botões para feedback visual
        const button = this.buttons[buttonIndex];
        button.classList.add('active');
        this.playSound(parseInt(button.dataset.sound));
        
        // Enviar dados UDP IMEDIATAMENTE quando botão é pressionado
        if (this.isPlaying && !this.isShowingSequence) {
            // Resetar timer de inatividade quando botão é pressionado
            if (this.inactivityTimer) {
                clearTimeout(this.inactivityTimer);
                this.inactivityTimer = null;
            }
            
            this.playerSequence.push(buttonIndex);
            
            // Verificar se o botão está correto
            const isCorrect = this.playerSequence[this.currentIndex] === this.sequence[this.currentIndex];
            
            // Enviar pressionamento de botão para UDP
            this.sendButtonPressToUDP(buttonIndex, isCorrect);
            
            if (isCorrect) {
                this.currentIndex++;
                
                if (this.currentIndex === this.sequence.length) {
                    this.levelComplete();
                } else {
                    // Resetar timer de inatividade para o próximo botão
                    this.inactivityTimer = setTimeout(() => {
                        if (this.isPlaying && !this.isShowingSequence) {
                            console.log('⏰ Timer de inatividade expirado - Game Over!');
                            this.statusElement.textContent = '⏰ Tempo esgotado! Game Over por inatividade!';
                            this.endGame();
                        }
                    }, this.inactivityTime * 1000);
                }
            } else {
                this.endGame();
            }
        }
        
        setTimeout(() => {
            button.classList.remove('active');
        }, 200);
    }
    
    levelComplete() {
        this.score += 1;
        this.level++;
        this.speed = Math.max(400, this.speed - 30);
        
        // Limpar timer de inatividade
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        this.updateDisplay();
        this.statusElement.textContent = `Nível ${this.level - 1} completo! Pontos: ${this.score}. Próximo: ${this.level} botões!`;
        
        setTimeout(() => {
            this.generateSequence();
            // Pequeno delay para o Aparato processar a sequência
            setTimeout(() => {
                this.showSequence();
            }, 200);
        }, 2000);
    }
    
    endGame() {
        this.isPlaying = false;
        this.gameOver = true;
        
        // Limpar timer de inatividade
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        // Adicionar partida ao histórico
        this.addGameToHistory();
        
        this.buttons.forEach(button => {
            button.style.pointerEvents = 'none';
        });
        
        // Verificar se bateu o recorde
        const isNewRecord = this.score > this.record;
        if (isNewRecord) {
            this.record = this.score;
            localStorage.setItem('geniusRecord', this.score);
            this.updateDisplay();
            this.statusElement.textContent = `🏆 NOVO RECORDE! 🏆 ${this.score} pontos!`;
            console.log('Novo recorde salvo:', this.score);
        } else {
            this.statusElement.textContent = `Game Over! Pontuação: ${this.score} | Recorde: ${this.record}`;
        }
        
        // Enviar Game Over para UDP
        this.sendGameOverToUDP(this.score, isNewRecord);
        
        // Mostrar o modal de status
        this.gameStatus.style.display = 'block';
        
        // Efeito de game over
        this.buttons.forEach(button => {
            button.style.animation = 'pulse 0.5s ease-in-out';
        });
        
        setTimeout(() => {
            this.buttons.forEach(button => {
                button.style.animation = '';
            });
            
            // Iniciar celebração
            this.celebrateGameOver();
        }, 2000);
    }
    
    resetGame() {
        this.sequence = [];
        this.playerSequence = [];
        this.score = 0;
        this.level = 1;
        this.isPlaying = false;
        this.isShowingSequence = false;
        this.currentIndex = 0;
        this.speed = 800;
        this.sequenceLength = 0;
        this.gameOver = false;
        this.readyForRestart = false;
        
        // Limpar timer de inatividade
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        this.buttons.forEach(button => {
            button.classList.remove('active');
            button.style.pointerEvents = 'auto';
            button.style.animation = '';
        });
        
        this.updateDisplay();
        this.statusElement.textContent = 'Pressione qualquer tecla para começar!';
        
        // Mostrar o modal de status
        this.gameStatus.style.display = 'block';
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.recordElement.textContent = this.record;
        this.levelElement.textContent = this.level;
        
        console.log('Display atualizado - Score:', this.score, 'Record:', this.record);
    }
    
    testLocalStorage() {
        console.log('=== TESTE LOCALSTORAGE ===');
        console.log('localStorage disponível:', typeof(Storage) !== "undefined");
        console.log('geniusRecord no localStorage:', localStorage.getItem('geniusRecord'));
        console.log('Record atual:', this.record);
        console.log('Score atual:', this.score);
        
        // Testar salvamento
        localStorage.setItem('teste', '123');
        console.log('Teste de salvamento:', localStorage.getItem('teste'));
        localStorage.removeItem('teste');
        console.log('=== FIM TESTE ===');
    }
    
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            console.log('Tecla pressionada:', e.key, 'isPlaying:', this.isPlaying, 'gameOver:', this.gameOver);
            
            // Se não estiver jogando, qualquer tecla inicia o jogo
            if (!this.isPlaying && !this.gameOver) {
                console.log('Iniciando jogo...');
                this.startGame();
            }
            // Se o jogo acabou e está pronto para reiniciar, qualquer tecla reinicia
            else if (this.gameOver && this.readyForRestart) {
                console.log('Reiniciando após game over...');
                this.restartAfterGameOver();
            }
        });
    }
    
    initGamepad() {
        console.log('🎮 Inicializando suporte para gamepad...');
        
        // Detectar quando um gamepad é conectado
        window.addEventListener('gamepadconnected', (e) => {
            console.log('🎮 Gamepad conectado:', e.gamepad);
            console.log('🎮 Botões disponíveis:', e.gamepad.buttons.length);
            this.gamepad = e.gamepad;
            this.startGamepadPolling();
        });
        
        // Detectar quando um gamepad é desconectado
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('🎮 Gamepad desconectado:', e.gamepad);
            this.gamepad = null;
            this.stopGamepadPolling();
        });
        
        // Verificar se já há um gamepad conectado
        if (navigator.getGamepads && navigator.getGamepads()[0]) {
            this.gamepad = navigator.getGamepads()[0];
            console.log('🎮 Gamepad já conectado:', this.gamepad);
            console.log('🎮 Botões disponíveis:', this.gamepad.buttons.length);
            this.startGamepadPolling();
        } else {
            console.log('🎮 Nenhum gamepad detectado inicialmente');
        }
    }
    
    startGamepadPolling() {
        if (this.gamepadPollingInterval) return;
        
        this.gamepadPollingInterval = setInterval(() => {
            this.pollGamepad();
        }, 16); // ~60 FPS
        
        console.log('Polling de gamepad iniciado');
    }
    
    stopGamepadPolling() {
        if (this.gamepadPollingInterval) {
            clearInterval(this.gamepadPollingInterval);
            this.gamepadPollingInterval = null;
            console.log('Polling de gamepad parado');
        }
    }
    
    pollGamepad() {
        if (!this.gamepad) return;
        
        // Atualizar o gamepad
        const gamepads = navigator.getGamepads();
        this.gamepad = gamepads[this.gamepad.index] || null;
        
        if (!this.gamepad) return;
        
        // Mapear botões do gamepad para botões do jogo
        // Mapeamento: gamepad botão 0-5 → button 0-5 (sequência visual)
        // 0→1(vermelho), 1→2(branco), 2→3(âmbar), 3→4(azul), 4→5(amarelo), 5→6(verde)
        for (let i = 0; i < 6; i++) {
            if (this.gamepad.buttons[i] && this.gamepad.buttons[i].pressed) {
                // Evitar múltiplos cliques
                if (!this.gamepadButtonStates[i]) {
                    this.gamepadButtonStates[i] = true;
                    console.log(`🎮 Gamepad botão ${i} pressionado! (mapeado para button ${i})`);
                    
                    // Se não estiver jogando, qualquer botão inicia o jogo
                    if (!this.isPlaying && !this.gameOver) {
                        console.log(`🎮 Gamepad botão ${i}: Iniciando jogo... (isPlaying: ${this.isPlaying}, gameOver: ${this.gameOver})`);
                        this.startGame();
                    } else if (this.isPlaying && !this.isShowingSequence) {
                        // Se estiver jogando, processa o clique do botão
                        console.log(`🎮 Gamepad botão ${i}: Processando clique durante jogo...`);
                        this.handleButtonClick(i);
                    } else {
                        console.log(`🎮 Gamepad botão ${i}: Jogo em estado não jogável (isPlaying: ${this.isPlaying}, isShowingSequence: ${this.isShowingSequence})`);
                    }
                }
            } else {
                this.gamepadButtonStates[i] = false;
            }
        }
        
        // Botões de controle especiais
        // Botão 9 (start) para iniciar o jogo (mantido como alternativa)
        if (this.gamepad.buttons[9] && this.gamepad.buttons[9].pressed) {
            if (!this.gamepadButtonStates[9]) {
                this.gamepadButtonStates[9] = true;
                if (!this.isPlaying && !this.gameOver) {
                    console.log('🎮 Gamepad botão 9 (start): Iniciando jogo...');
                    this.startGame();
                }
            }
        } else {
            this.gamepadButtonStates[9] = false;
        }
        
        // Qualquer botão do gamepad pode reiniciar após game over
        for (let i = 0; i < this.gamepad.buttons.length; i++) {
            if (this.gamepad.buttons[i] && this.gamepad.buttons[i].pressed) {
                if (!this.gamepadButtonStates[i]) {
                    this.gamepadButtonStates[i] = true;
                    if (this.gameOver && this.readyForRestart) {
                        console.log(`Gamepad botão ${i}: Reiniciando após game over...`);
                        this.restartAfterGameOver();
                        break;
                    }
                }
            } else {
                this.gamepadButtonStates[i] = false;
            }
        }
    }
    
    createConfetti() {
        this.confettiContainer.innerHTML = '';
        
        const scoreCircle = document.querySelector('.score-circle');
        const rect = scoreCircle.getBoundingClientRect();
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Posicionar confetti apenas dentro do círculo
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (rect.width / 2) * 0.9; // 90% do raio
            const x = rect.left + rect.width / 2 + Math.cos(angle) * distance;
            const y = rect.top + rect.height / 2 + Math.sin(angle) * distance;
            
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.animationDelay = Math.random() * 2 + 's';
            this.confettiContainer.appendChild(confetti);
        }
        
        // Limpar confetti após 5 segundos
        setTimeout(() => {
            this.confettiContainer.innerHTML = '';
        }, 5000);
    }
    
    createFireworks() {
        const scoreCircle = document.querySelector('.score-circle');
        const rect = scoreCircle.getBoundingClientRect();
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                
                // Posicionar fogos apenas dentro do círculo
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * (rect.width / 2) * 0.8; // 80% do raio
                const x = rect.left + rect.width / 2 + Math.cos(angle) * distance;
                const y = rect.top + rect.height / 2 + Math.sin(angle) * distance;
                
                firework.style.left = x + 'px';
                firework.style.top = y + 'px';
                firework.style.background = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#a55eea', '#fd79a8'][Math.floor(Math.random() * 6)];
                document.body.appendChild(firework);
                
                setTimeout(() => {
                    firework.remove();
                }, 2000);
            }, i * 80);
        }
    }
    
    createRainbowEffect() {
        const scoreCircle = document.querySelector('.score-circle');
        const colors = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff', '#ff0080'];
        let colorIndex = 0;
        
        const rainbowInterval = setInterval(() => {
            scoreCircle.style.background = `radial-gradient(circle, ${colors[colorIndex]} 0%, ${colors[(colorIndex + 1) % colors.length]} 50%, ${colors[(colorIndex + 2) % colors.length]} 100%)`;
            colorIndex = (colorIndex + 1) % colors.length;
        }, 200);
        
        // Parar o efeito após 5 segundos
        setTimeout(() => {
            clearInterval(rainbowInterval);
            scoreCircle.style.background = 'radial-gradient(circle, #2d3748 0%, #1a202c 100%)';
        }, 5000);
    }
    
    createParticleExplosion() {
        const scoreCircle = document.querySelector('.score-circle');
        const rect = scoreCircle.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = rect.width / 2;
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                particle.style.width = '8px';
                particle.style.height = '8px';
                particle.style.borderRadius = '50%';
                particle.style.background = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#a55eea', '#fd79a8'][Math.floor(Math.random() * 6)];
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '50';
                particle.style.transition = 'all 3s ease-out';
                
                document.body.appendChild(particle);
                
                // Animação de explosão dentro do círculo
                setTimeout(() => {
                    const angle = (i / 50) * Math.PI * 2;
                    const distance = Math.random() * radius * 0.8; // 80% do raio do círculo
                    const x = centerX + Math.cos(angle) * distance;
                    const y = centerY + Math.sin(angle) * distance;
                    
                    particle.style.left = x + 'px';
                    particle.style.top = y + 'px';
                    particle.style.opacity = '0';
                    particle.style.transform = 'scale(0)';
                }, 50);
                
                // Remover partícula após animação
                setTimeout(() => {
                    particle.remove();
                }, 3000);
            }, i * 50);
        }
    }
    
    celebrateGameOver() {
        // Esconder o modal durante os efeitos
        this.gameStatus.style.display = 'none';
        
        this.createConfetti();
        this.createFireworks();
        this.createRainbowEffect();
        this.createParticleExplosion();
        
        // Mostrar mensagem de parabéns sem modal
        this.showCongratulationsMessage();
        
        this.readyForRestart = true;
        
        // Auto-restart após 8 segundos
        setTimeout(() => {
            if (this.readyForRestart) {
                this.restartAfterGameOver();
            }
        }, 8000);
    }
    
    showCongratulationsMessage() {
        // Criar mensagem flutuante no centro da tela
        const congratsDiv = document.createElement('div');
        congratsDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 30px 50px;
            border-radius: 20px;
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            z-index: 1000;
            border: 3px solid #f6ad55;
            box-shadow: 0 0 30px rgba(246, 173, 85, 0.8);
            animation: congratsPulse 2s ease-in-out infinite;
        `;
        congratsDiv.innerHTML = '🎉 PARABÉNS! 🎉<br>Pressione qualquer tecla para jogar novamente!';
        
        document.body.appendChild(congratsDiv);
        
        // Remover mensagem após 8 segundos
        setTimeout(() => {
            congratsDiv.remove();
        }, 8000);
    }
    
    restartAfterGameOver() {
        this.readyForRestart = false;
        
        // Limpar qualquer mensagem de parabéns
        const congratsElements = document.querySelectorAll('div[style*="z-index: 1000"]');
        congratsElements.forEach(el => el.remove());
        
        this.resetGame();
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Sistema de Configurações
    loadConfig() {
        const defaultConfig = {
            theme: 'default',
            inactivityTime: 5,
            volume: 30,
            soundEnabled: true,
            udpHost: '127.0.0.1',
            udpPort: 3000
        };
        
        try {
            const savedConfig = localStorage.getItem('geniusConfig');
            return savedConfig ? { ...defaultConfig, ...JSON.parse(savedConfig) } : defaultConfig;
        } catch (e) {
            console.log('Erro ao carregar configurações:', e);
            return defaultConfig;
        }
    }
    
    saveConfig() {
        try {
            const newConfig = {
                theme: document.getElementById('themeSelect').value,
                inactivityTime: parseInt(document.getElementById('inactivitySlider').value),
                volume: parseInt(document.getElementById('volumeSlider').value),
                soundEnabled: document.getElementById('soundEnabled').checked,
                udpHost: document.getElementById('udpHost').value,
                udpPort: 3000
            };
            
            localStorage.setItem('geniusConfig', JSON.stringify(newConfig));
            this.config = newConfig;
            this.inactivityTime = newConfig.inactivityTime;
            this.volume = newConfig.volume;
            this.soundEnabled = newConfig.soundEnabled;
            this.theme = newConfig.theme;
            
            this.applyTheme();
            this.closeConfigModal();
            
            console.log('✅ Configurações salvas:', newConfig);
        } catch (e) {
            console.log('❌ Erro ao salvar configurações:', e);
        }
    }
    
    resetConfig() {
        try {
            localStorage.removeItem('geniusConfig');
            this.config = this.loadConfig();
            this.loadConfigToUI();
            this.applyTheme();
            console.log('🔄 Configurações resetadas para padrão');
        } catch (e) {
            console.log('❌ Erro ao resetar configurações:', e);
        }
    }
    
    loadConfigToUI() {
        document.getElementById('themeSelect').value = this.config.theme;
        document.getElementById('inactivitySlider').value = this.config.inactivityTime;
        document.getElementById('inactivityValue').textContent = `${this.config.inactivityTime} segundos`;
        document.getElementById('volumeSlider').value = this.config.volume;
        document.getElementById('volumeValue').textContent = `${this.config.volume}%`;
        document.getElementById('soundEnabled').checked = this.config.soundEnabled;
        document.getElementById('udpHost').value = this.config.udpHost;
    }
    
    applyTheme() {
        document.body.className = `theme-${this.theme}`;
        
        // Aplicar tema específico
        switch (this.theme) {
            case 'dark':
                document.documentElement.style.setProperty('--bg-color', '#1a202c');
                document.documentElement.style.setProperty('--text-color', '#e2e8f0');
                break;
            case 'light':
                document.documentElement.style.setProperty('--bg-color', '#f7fafc');
                document.documentElement.style.setProperty('--text-color', '#2d3748');
                break;
            case 'neon':
                document.documentElement.style.setProperty('--bg-color', '#0a0a0a');
                document.documentElement.style.setProperty('--text-color', '#00ff00');
                break;
            default:
                document.documentElement.style.setProperty('--bg-color', '#2d3748');
                document.documentElement.style.setProperty('--text-color', '#e2e8f0');
        }
    }
    
    // Sistema de Relatórios
    loadGameHistory() {
        try {
            const savedHistory = localStorage.getItem('geniusGameHistory');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (e) {
            console.log('Erro ao carregar histórico:', e);
            return [];
        }
    }
    
    saveGameHistory(gameData) {
        try {
            this.gameHistory.push(gameData);
            localStorage.setItem('geniusGameHistory', JSON.stringify(this.gameHistory));
        } catch (e) {
            console.log('Erro ao salvar histórico:', e);
        }
    }
    
    addGameToHistory() {
        if (this.gameStartTime) {
            const gameDuration = Math.round((Date.now() - this.gameStartTime) / 1000);
            const gameData = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString('pt-BR'),
                time: new Date().toLocaleTimeString('pt-BR'),
                score: this.score,
                level: this.level - 1,
                duration: gameDuration,
                isNewRecord: this.score > this.record,
                player: 'Jogador' // Pode ser expandido para múltiplos jogadores
            };
            
            this.saveGameHistory(gameData);
            this.gameStartTime = null;
        }
    }
    
    generateReport() {
        const totalGames = this.gameHistory.length;
        const bestScore = Math.max(...this.gameHistory.map(g => g.score), 0);
        const averageScore = totalGames > 0 ? Math.round(this.gameHistory.reduce((sum, g) => sum + g.score, 0) / totalGames) : 0;
        const totalPlayers = new Set(this.gameHistory.map(g => g.player)).size;
        
        // Atualizar resumo
        document.getElementById('totalGames').textContent = totalGames;
        document.getElementById('bestScore').textContent = bestScore;
        document.getElementById('averageScore').textContent = averageScore;
        document.getElementById('totalPlayers').textContent = totalPlayers;
        
        // Atualizar tabela
        const tbody = document.getElementById('gamesTableBody');
        tbody.innerHTML = '';
        
        this.gameHistory.slice().reverse().forEach(game => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${game.date} ${game.time}</td>
                <td>${game.player}</td>
                <td>${game.score}</td>
                <td>${game.level}</td>
                <td>${game.duration}s</td>
                <td>${game.isNewRecord ? '🏆 Recorde' : 'Completo'}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    exportReport() {
        try {
            const headers = ['Data', 'Hora', 'Jogador', 'Pontuação', 'Nível', 'Duração', 'Status'];
            const csvContent = [
                headers.join(','),
                ...this.gameHistory.map(game => [
                    game.date,
                    game.time,
                    game.player,
                    game.score,
                    game.level,
                    game.duration,
                    game.isNewRecord ? 'RECORDE' : 'Completo'
                ].join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `genius_report_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            
            console.log('✅ Relatório exportado com sucesso');
        } catch (e) {
            console.log('❌ Erro ao exportar relatório:', e);
        }
    }
    
    printReport() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Relatório Genius JJ</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
                        .summary-card { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🎮 Genius JJ - Relatório de Partidas</h1>
                        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
                    </div>
                    
                    <div class="summary">
                        <div class="summary-card">
                            <h3>Total de Partidas</h3>
                            <span>${this.gameHistory.length}</span>
                        </div>
                        <div class="summary-card">
                            <h3>Recorde</h3>
                            <span>${Math.max(...this.gameHistory.map(g => g.score), 0)}</span>
                        </div>
                        <div class="summary-card">
                            <h3>Média</h3>
                            <span>${this.gameHistory.length > 0 ? Math.round(this.gameHistory.reduce((sum, g) => sum + g.score, 0) / this.gameHistory.length) : 0}</span>
                        </div>
                        <div class="summary-card">
                            <h3>Jogadores</h3>
                            <span>${new Set(this.gameHistory.map(g => g.player)).size}</span>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Hora</th>
                                <th>Jogador</th>
                                <th>Pontuação</th>
                                <th>Nível</th>
                                <th>Duração</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.gameHistory.slice().reverse().map(game => `
                                <tr>
                                    <td>${game.date}</td>
                                    <td>${game.time}</td>
                                    <td>${game.player}</td>
                                    <td>${game.score}</td>
                                    <td>${game.level}</td>
                                    <td>${game.duration}s</td>
                                    <td>${game.isNewRecord ? '🏆 RECORDE' : 'Completo'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
    
    clearHistory() {
        if (confirm('Tem certeza que deseja limpar todo o histórico de partidas?')) {
            this.gameHistory = [];
            localStorage.removeItem('geniusGameHistory');
            this.generateReport();
            console.log('🗑️ Histórico limpo');
        }
    }
    
    // Controles dos Modais
    openConfigModal() {
        this.loadConfigToUI();
        document.getElementById('configModal').style.display = 'block';
    }
    
    closeConfigModal() {
        document.getElementById('configModal').style.display = 'none';
    }
    
    openReportModal() {
        this.generateReport();
        document.getElementById('reportModal').style.display = 'block';
    }
    
    closeReportModal() {
        document.getElementById('reportModal').style.display = 'none';
    }
    
    // Atalhos de Teclado
    bindShortcuts() {
        document.addEventListener('keydown', (e) => {
            // F1 - Configurações
            if (e.key === 'F1') {
                e.preventDefault();
                this.openConfigModal();
            }
            // F2 - Relatório
            else if (e.key === 'F2') {
                e.preventDefault();
                this.openReportModal();
            }
            // F3 - Estatísticas (pode ser expandido)
            else if (e.key === 'F3') {
                e.preventDefault();
                this.openReportModal();
            }
        });
        
        // Fechar modais com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeConfigModal();
                this.closeReportModal();
            }
        });
        
        // Fechar modais clicando fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeConfigModal();
                this.closeReportModal();
            }
        });
    }
    
    // Atualizar valores dos sliders
    updateSliderValues() {
        const inactivitySlider = document.getElementById('inactivitySlider');
        const inactivityValue = document.getElementById('inactivityValue');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeValue = document.getElementById('volumeValue');
        
        if (inactivitySlider && inactivityValue) {
            inactivitySlider.addEventListener('input', () => {
                inactivityValue.textContent = `${inactivitySlider.value} segundos`;
            });
        }
        
        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', () => {
                volumeValue.textContent = `${volumeSlider.value}%`;
            });
        }
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.game = new GeniusGame();
});

// Adicionar efeitos visuais extras
document.addEventListener('DOMContentLoaded', () => {
    // Efeito de partículas de fundo
    createBackgroundParticles();
    
    // Efeito de brilho nos botões
    addButtonGlowEffects();
});

function createBackgroundParticles() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
            this.opacity = Math.random() * 0.5;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 179, 237, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function addButtonGlowEffects() {
    const buttons = document.querySelectorAll('.game-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            const color = getComputedStyle(button).background;
            button.style.boxShadow = `0 0 30px ${color}, 0 0 60px ${color}`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.boxShadow = '';
        });
    });
}
