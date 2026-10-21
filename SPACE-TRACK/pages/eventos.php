<?php
/**
 * eventos.php — Agenda de eventos (listar, cadastrar e excluir).
 *
 * Toda a lógica PHP fica neste bloco do topo, antes de qualquer HTML.
 * O HTML mais abaixo só exibe o que já foi calculado aqui.
 */

require '../php/db.php';

$aviso = '';   // mensagem mostrada ao usuário depois de uma ação

/* ---------- CADASTRAR ----------
   O formulário envia por POST com um campo escondido acao="cadastrar". */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['acao'] ?? '') === 'cadastrar') {

    $titulo    = trim($_POST['titulo'] ?? '');
    $data      = trim($_POST['data_evento'] ?? '');
    $descricao = trim($_POST['descricao'] ?? '');

    if ($titulo === '' || $data === '') {
        $aviso = 'Preencha ao menos o título e a data do evento.';
    } else {
        // Prepared statement: os dados nunca entram concatenados no SQL.
        $sql = 'INSERT INTO eventos (titulo, data_evento, descricao) VALUES (?, ?, ?)';
        $pdo->prepare($sql)->execute([$titulo, $data, $descricao]);

        // Redireciona depois de gravar para o F5 não reenviar o formulário.
        header('Location: eventos.php?ok=cadastrado');
        exit;
    }
}

/* ---------- EXCLUIR ----------
   O botão de cada cartão envia POST com acao="excluir" e o id. */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['acao'] ?? '') === 'excluir') {

    $id = (int) ($_POST['id'] ?? 0);

    if ($id > 0) {
        $pdo->prepare('DELETE FROM eventos WHERE id = ?')->execute([$id]);
    }

    header('Location: eventos.php?ok=excluido');
    exit;
}

/* ---------- MENSAGENS DE RETORNO ---------- */
if (isset($_GET['ok'])) {
    $aviso = $_GET['ok'] === 'cadastrado'
        ? 'Evento cadastrado na agenda.'
        : 'Evento removido da agenda.';
}

/* ---------- LISTAR ----------
   Busca todos os eventos, do mais próximo para o mais distante. */
$eventos = $pdo->query('SELECT * FROM eventos ORDER BY data_evento ASC')->fetchAll();

/** Atalho para escapar texto vindo do banco antes de imprimir na tela. */
function e(?string $texto): string {
    return htmlspecialchars($texto ?? '', ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agenda de eventos — SpaceTrack</title>
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>

  <header class="topo">
    <a class="marca" href="../index.html">Space<span>Track</span></a>
    <nav class="menu">
      <a href="../index.html">Início</a>
      <a href="guia.html">Guia de observação</a>
      <a href="eventos.php" class="ativo">Agenda</a>
    </nav>
  </header>

  <main class="conteudo">

    <section class="hero">
      <h1>Agenda de eventos</h1>
      <p class="chamada">
        Sua lista pessoal de noites marcadas. Cadastre o que pretende observar
        e vá riscando conforme o céu colabora.
      </p>
    </section>

    <!-- ===== Formulário de cadastro ===== -->
    <section class="secao">
      <h2>Adicionar evento</h2>

      <form class="formulario" method="post" action="eventos.php">
        <input type="hidden" name="acao" value="cadastrar">

        <div class="campo">
          <label for="titulo">Título</label>
          <input type="text" id="titulo" name="titulo" maxlength="120"
                 placeholder="Ex.: Conjunção entre Vênus e a Lua" required>
        </div>

        <div class="campo">
          <label for="data_evento">Data</label>
          <input type="date" id="data_evento" name="data_evento" required>
        </div>

        <div class="campo campo-largo">
          <label for="descricao">O que observar</label>
          <textarea id="descricao" name="descricao"
                    placeholder="Horário, direção do céu, equipamento necessário…"></textarea>
        </div>

        <button type="submit" class="botao">Salvar evento</button>
      </form>

      <?php if ($aviso !== ''): ?>
        <p class="aviso"><?= e($aviso) ?></p>
      <?php endif; ?>
    </section>

    <!-- ===== Lista de eventos cadastrados ===== -->
    <section class="secao">
      <h2>Eventos na agenda (<?= count($eventos) ?>)</h2>

      <?php if (count($eventos) === 0): ?>

        <p class="vazio">A agenda está vazia. Cadastre o primeiro evento no formulário acima.</p>

      <?php else: ?>

        <div class="grade">
          <?php foreach ($eventos as $evento): ?>
            <article class="cartao">
              <span class="data-tag">
                <?= date('d/m/Y', strtotime($evento['data_evento'])) ?>
              </span>

              <h3><?= e($evento['titulo']) ?></h3>

              <p><?= nl2br(e($evento['descricao'])) ?></p>

              <!-- Exclusão por POST, com confirmação antes de apagar. -->
              <form method="post" action="eventos.php" style="margin-top:16px"
                    onsubmit="return confirm('Excluir este evento da agenda?');">
                <input type="hidden" name="acao" value="excluir">
                <input type="hidden" name="id" value="<?= (int) $evento['id'] ?>">
                <button type="submit" class="botao-apagar">Excluir</button>
              </form>
            </article>
          <?php endforeach; ?>
        </div>

      <?php endif; ?>
    </section>

  </main>

  <footer class="rodape">
    SpaceTrack — projeto de estudo feito por Pablo em HTML, CSS, JavaScript e PHP.
  </footer>

</body>
</html>
