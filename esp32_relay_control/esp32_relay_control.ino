/*
 * ESP32 Relay Control para Genius Game
 * Controla 6 relés baseado em comandos seriais
 * 
 * Portas dos relés:
 * D4  -> Relé 1 (Botão 0)
 * D16 -> Relé 2 (Botão 1) 
 * D17 -> Relé 3 (Botão 2)
 * D5  -> Relé 4 (Botão 3)
 * D18 -> Relé 5 (Botão 4)
 * D19 -> Relé 6 (Botão 5)
 * 
 * Comandos:
 * 10, 20, 30, 40, 50, 60 -> Desliga relés 1-6
 * 11, 21, 31, 41, 51, 61 -> Liga relés 1-6
 */

// Definição das portas dos relés
const int RELAY_PINS[] = {4, 16, 17, 5, 18, 19};
const int NUM_RELAYS = 6;

// Estados dos relés (false = desligado, true = ligado)
bool relayStates[NUM_RELAYS] = {false, false, false, false, false, false};

// Buffer para comandos seriais
String serialBuffer = "";

void setup() {
  // Inicializar comunicação serial
  Serial.begin(115200);
  Serial.println("ESP32 Relay Control - Genius Game");
  Serial.println("Aguardando comandos...");
  
  // Configurar portas dos relés como saída
  for (int i = 0; i < NUM_RELAYS; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], HIGH); // HIGH = relé desligado (lógica invertida)
    Serial.printf("Relé %d configurado na porta D%d\n", i + 1, RELAY_PINS[i]);
  }
  
  Serial.println("Sistema pronto!");
  Serial.println("Comandos: 10-60 (desligar), 11-61 (ligar)");
  Serial.println("Exemplo: 11 liga relé 1, 20 desliga relé 2");
}

void loop() {
  // Verificar se há dados disponíveis na serial
  if (Serial.available()) {
    char c = Serial.read();
    
    // Adicionar caractere ao buffer
    if (c >= '0' && c <= '9') {
      serialBuffer += c;
    }
    
    // Processar comando quando buffer tem 2 dígitos
    if (serialBuffer.length() == 2) {
      processCommand(serialBuffer);
      serialBuffer = ""; // Limpar buffer
    }
  }
  
  // Pequeno delay para estabilidade
  delay(10);
}

void processCommand(String command) {
  int relayIndex = (command.charAt(0) - '0') - 1; // Converter primeiro dígito para índice (0-5)
  int action = command.charAt(1) - '0'; // Converter segundo dígito para ação (0=desligar, 1=ligar)
  
  // Validar índice do relé
  if (relayIndex < 0 || relayIndex >= NUM_RELAYS) {
    Serial.printf("ERRO: Relé %d não existe (válido: 1-6)\n", relayIndex + 1);
    return;
  }
  
  // Validar ação
  if (action != 0 && action != 1) {
    Serial.printf("ERRO: Ação %d inválida (0=desligar, 1=ligar)\n", action);
    return;
  }
  
  // Executar comando
  if (action == 1) {
    // Ligar relé
    digitalWrite(RELAY_PINS[relayIndex], LOW); // LOW = relé ligado (lógica invertida)
    relayStates[relayIndex] = true;
    Serial.printf("✅ Relé %d LIGADO (porta D%d)\n", relayIndex + 1, RELAY_PINS[relayIndex]);
  } else {
    // Desligar relé
    digitalWrite(RELAY_PINS[relayIndex], HIGH); // HIGH = relé desligado (lógica invertida)
    relayStates[relayIndex] = false;
    Serial.printf("❌ Relé %d DESLIGADO (porta D%d)\n", relayIndex + 1, RELAY_PINS[relayIndex]);
  }
  
  // Mostrar status atual
  showStatus();
}

void showStatus() {
  Serial.println("📊 Status dos Relés:");
  for (int i = 0; i < NUM_RELAYS; i++) {
    String status = relayStates[i] ? "LIGADO" : "DESLIGADO";
    Serial.printf("  Relé %d (D%d): %s\n", i + 1, RELAY_PINS[i], status.c_str());
  }
  Serial.println("---");
}

// Função para ligar todos os relés (teste)
void turnAllOn() {
  Serial.println("🔴 Ligando todos os relés...");
  for (int i = 0; i < NUM_RELAYS; i++) {
    digitalWrite(RELAY_PINS[i], LOW);
    relayStates[i] = true;
  }
  showStatus();
}

// Função para desligar todos os relés (teste)
void turnAllOff() {
  Serial.println("⚫ Desligando todos os relés...");
  for (int i = 0; i < NUM_RELAYS; i++) {
    digitalWrite(RELAY_PINS[i], HIGH);
    relayStates[i] = false;
  }
  showStatus();
}

// Função para teste sequencial
void testSequence() {
  Serial.println("🎮 Teste sequencial dos relés...");
  
  // Ligar um por vez
  for (int i = 0; i < NUM_RELAYS; i++) {
    Serial.printf("Testando relé %d...\n", i + 1);
    digitalWrite(RELAY_PINS[i], LOW);
    delay(500);
    digitalWrite(RELAY_PINS[i], HIGH);
    delay(200);
  }
  
  Serial.println("Teste sequencial concluído!");
}
