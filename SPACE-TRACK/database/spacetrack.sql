-- ===========================================================
-- SpaceTrack — Rastreador Espacial
-- Script de criação do banco de dados
-- Rode este arquivo no phpMyAdmin (aba "Importar" ou "SQL")
-- ===========================================================

CREATE DATABASE IF NOT EXISTS spacetrack
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE spacetrack;

CREATE TABLE IF NOT EXISTS eventos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  titulo      VARCHAR(120) NOT NULL,
  data_evento DATE         NOT NULL,
  descricao   TEXT         NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alguns registros de exemplo para a lista não nascer vazia.
INSERT INTO eventos (titulo, data_evento, descricao) VALUES
('Chuva de meteoros Oriônidas', '2026-10-21', 'Restos do cometa Halley. Pico por volta das 3h da manhã, olhando para o leste. Melhor a olho nu, sem telescópio.'),
('Chuva de meteoros Geminídeas', '2026-12-14', 'A chuva mais generosa do ano, com até 120 meteoros por hora em céu escuro. Vale a viagem para longe da cidade.'),
('Eclipse anular do Sol', '2027-02-06', 'Visível como parcial em boa parte do Brasil. Nunca observe sem filtro solar certificado.');
