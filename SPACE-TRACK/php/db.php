<?php
/**
 * db.php — Conexão única com o MySQL via PDO.
 *
 * Qualquer página que precise do banco faz:  require 'db.php';
 * e passa a ter a variável $pdo disponível.
 *
 * No XAMPP/WAMP o usuário padrão é "root" e a senha costuma ser vazia.
 * Se a sua instalação tiver senha, troque abaixo.
 */

$host  = 'localhost';
$banco = 'spacetrack';
$user  = 'root';
$senha = '';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$banco;charset=utf8mb4",
        $user,
        $senha,
        [
            // Erros viram exceções: facilita muito achar problemas.
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            // Resultados vêm como array associativo ($linha['titulo']).
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            // Usa prepared statements de verdade, não emulados.
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Em produção você registraria o erro em log em vez de mostrar na tela.
    exit('Não foi possível conectar ao banco: ' . $e->getMessage());
}
