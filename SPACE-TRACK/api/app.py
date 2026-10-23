"""
app.py — API Flask do SpaceTrack (listar e cadastrar eventos).

Banco: SQLite. Não precisa instalar nem ligar servidor nenhum: o banco é um
arquivo (spacetrack.db) criado automaticamente ao iniciar a API, já com três
eventos de exemplo.

Como rodar:
    pip install -r requirements.txt
    python app.py
Teste no navegador: http://localhost:5000/eventos
"""

import sqlite3
from datetime import datetime
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# CORS: libera a página (aberta de outra origem, como o Live Server em
# localhost:5500) para chamar esta API em localhost:5000. Sem isso o
# navegador bloqueia a requisição.
CORS(app)

# O arquivo do banco fica na mesma pasta do app.py.
BANCO = Path(__file__).parent / 'spacetrack.db'


def conectar():
    """Abre uma conexão com o SQLite. Row permite acessar colunas por nome."""
    conexao = sqlite3.connect(BANCO)
    conexao.row_factory = sqlite3.Row
    return conexao


def criar_banco():
    """Cria a tabela se não existir e, na primeira vez, insere exemplos."""
    conexao = conectar()
    try:
        conexao.execute(
            'CREATE TABLE IF NOT EXISTS eventos ('
            '  id INTEGER PRIMARY KEY AUTOINCREMENT,'
            '  titulo TEXT NOT NULL,'
            '  data_evento TEXT NOT NULL,'     # guardada como AAAA-MM-DD
            '  descricao TEXT)'
        )
        total = conexao.execute('SELECT COUNT(*) FROM eventos').fetchone()[0]
        if total == 0:
            conexao.executemany(
                'INSERT INTO eventos (titulo, data_evento, descricao) VALUES (?, ?, ?)',
                [
                    ('Chuva de meteoros Oriônidas', '2026-10-21',
                     'Restos do cometa Halley. Pico de madrugada, olhando para o leste.'),
                    ('Chuva de meteoros Geminídeas', '2026-12-14',
                     'A chuva mais generosa do ano, com até 120 meteoros por hora em céu escuro.'),
                    ('Eclipse anular do Sol', '2027-02-06',
                     'Visível como parcial em boa parte do Brasil. Só observe com filtro solar certificado.'),
                ],
            )
        conexao.commit()
    finally:
        conexao.close()


# ---------- GET /eventos: lista todos os eventos ----------
@app.get('/eventos')
def listar():
    conexao = conectar()
    try:
        linhas = conexao.execute(
            'SELECT id, titulo, data_evento, descricao '
            'FROM eventos ORDER BY data_evento ASC'
        ).fetchall()
    finally:
        conexao.close()

    # Cada linha vira um dicionário, que o jsonify converte em JSON.
    return jsonify([dict(linha) for linha in linhas])


# ---------- POST /eventos: cadastra um novo evento ----------
@app.post('/eventos')
def cadastrar():
    # silent=True devolve None (em vez de dar erro) se o corpo não for JSON.
    dados = request.get_json(silent=True) or {}

    titulo = (dados.get('titulo') or '').strip()
    data_evento = (dados.get('data_evento') or '').strip()
    descricao = (dados.get('descricao') or '').strip()

    if not titulo or not data_evento:
        return jsonify({'erro': 'Informe ao menos o título e a data.'}), 400

    # O SQLite aceita qualquer texto, então conferimos o formato da data aqui.
    try:
        datetime.strptime(data_evento, '%Y-%m-%d')
    except ValueError:
        return jsonify({'erro': 'Data inválida. Use o formato AAAA-MM-DD.'}), 400

    conexao = conectar()
    try:
        cursor = conexao.execute(
            'INSERT INTO eventos (titulo, data_evento, descricao) VALUES (?, ?, ?)',
            (titulo, data_evento, descricao),
        )
        conexao.commit()
        novo_id = cursor.lastrowid
    finally:
        conexao.close()

    # 201 = "Created": convenção HTTP para cadastro bem-sucedido.
    return jsonify({
        'id': novo_id,
        'titulo': titulo,
        'data_evento': data_evento,
        'descricao': descricao,
    }), 201


if __name__ == '__main__':
    criar_banco()
    app.run(debug=True, port=5000)