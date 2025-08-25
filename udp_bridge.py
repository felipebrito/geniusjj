#!/usr/bin/env python3
"""
Servidor ponte para Genius Game
Recebe dados HTTP e envia para UDP localhost:8888
"""

import json
import socket
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs
import time

class GeniusGameHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Página de status simples para evitar erro 501"""
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(b'Servidor ponte funcionando - POST para enviar dados')
    
    def do_POST(self):
        """Recebe dados POST do jogo Genius"""
        try:
            # Ler dados do corpo da requisição
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parsear JSON
            game_data = json.loads(post_data.decode('utf-8'))
            
            # Log dos dados recebidos
            print(f"🎮 === DADOS RECEBIDOS DO JOGO ===")
            print(f"🎮 Tipo: {game_data.get('type', 'N/A')}")
            print(f"🎮 Ação: {game_data.get('action', 'N/A')}")
            print(f"🎮 Timestamp: {game_data.get('timestamp', 'N/A')}")
            print(f"🎮 Dados completos: {json.dumps(game_data, indent=2, ensure_ascii=False)}")
            print(f"🎮 ================================")
            
            # Enviar para UDP localhost:8888
            self.send_to_udp(game_data)
            
            # Resposta de sucesso
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {"status": "success", "message": "Dados enviados para UDP"}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            print(f"❌ Erro ao processar requisição: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {"status": "error", "message": str(e)}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        """Suporte para CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def send_to_udp(self, data):
        """Envia dados para UDP localhost:8888"""
        try:
            # Criar socket UDP
            udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            udp_socket.settimeout(2)  # Timeout de 2 segundos
            
            # Endereço de destino
            udp_address = ('127.0.0.1', 8888)
            
            # Converter dados para JSON e enviar
            json_data = json.dumps(data, ensure_ascii=False)
            udp_socket.sendto(json_data.encode('utf-8'), udp_address)
            
            print(f"📤 ✅ Dados enviados para UDP {udp_address}")
            print(f"📤 Conteúdo: {json_data}")
            
            udp_socket.close()
            
        except Exception as e:
            print(f"❌ Erro ao enviar para UDP: {e}")
            print(f"❌ Verifique se há um serviço escutando na porta 8888")

def run_server(port=3000):
    """Executa o servidor HTTP"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, GeniusGameHandler)
    
    print(f"🚀 Servidor ponte iniciado na porta {port}")
    print(f"🚀 Acesse: http://localhost:{port}")
    print(f"🚀 O jogo enviará dados para este servidor")
    print(f"🚀 Este servidor enviará para UDP localhost:8888")
    print(f"🚀 Pressione Ctrl+C para parar")
    print(f"🚀 ================================")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Servidor parado pelo usuário")
        httpd.server_close()

if __name__ == "__main__":
    run_server(3000)

