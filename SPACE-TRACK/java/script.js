/* ===========================================================
   SpaceTrack — JavaScript nativo (sem bibliotecas)

   Um único arquivo para as três páginas. Cada bloco só roda se o
   elemento dele existir na página aberta — por isso não há erro
   ao carregar este script tanto no index quanto no guia.

   1. Eventos (contagem regressiva e ferramenta de observação)
   2. Contagem regressiva
   3. "O que posso observar hoje?"
   4. Fase da lua
   5. API da NASA (imagem astronômica do dia)
   =========================================================== */

/* ---------- 1. Eventos ----------
   Cada evento tem uma data exata. Para incluir um novo, basta
   acrescentar uma linha nesta lista. */
const eventos = [
  { data: '2026-10-21', titulo: 'Chuva de meteoros Oriônidas',
    texto: 'Restos do cometa Halley. Pico de madrugada, olhando para o leste.' },
  { data: '2026-12-14', titulo: 'Chuva de meteoros Geminídeas',
    texto: 'A chuva mais intensa do ano, com até 120 meteoros por hora em céu escuro.' },
  { data: '2027-02-06', titulo: 'Eclipse anular do Sol',
    texto: 'Visível como parcial em boa parte do Brasil. Só observe com filtro solar certificado.' }
];

/** Converte "2026-10-21" em Date local, sem susto de fuso horário. */
function paraData(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/* ---------- 2. Contagem regressiva ---------- */
const painelContagem = document.getElementById('contagem');

if (painelContagem) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Pega o primeiro evento cuja data ainda não passou.
  const alvo = eventos
    .map(ev => ({ ...ev, data: paraData(ev.data) }))
    .filter(ev => ev.data >= hoje)
    .sort((a, b) => a.data - b.data)[0];

  document.getElementById('alvo-contagem').textContent =
    alvo.titulo + ' — ' + alvo.data.toLocaleDateString('pt-BR');

  function atualizarContagem() {
    const restante = alvo.data - new Date();

    if (restante <= 0) {
      painelContagem.innerHTML = `<div><strong>Hoje</strong><small>${alvo.titulo}</small></div>`;
      return;
    }

    const s = Math.floor(restante / 1000);
    document.getElementById('c-dias').textContent     = Math.floor(s / 86400);
    document.getElementById('c-horas').textContent    = Math.floor(s / 3600) % 24;
    document.getElementById('c-minutos').textContent  = Math.floor(s / 60) % 60;
    document.getElementById('c-segundos').textContent = s % 60;
  }

  atualizarContagem();
  setInterval(atualizarContagem, 1000);
}

/* ---------- 3. "O que posso observar hoje?" ---------- */
const campoData = document.getElementById('data-observacao');
const areaResultado = document.getElementById('resultado-observacao');

if (campoData && areaResultado) {
  campoData.value = new Date().toISOString().slice(0, 10); // já abre com hoje

  function mostrarObservacao() {
    const evento = eventos.find(ev => ev.data === campoData.value);

    areaResultado.innerHTML = evento
      ? `<h3>${evento.titulo}</h3><p>${evento.texto}</p>`
      : '<h3>Nenhum evento marcado</h3><p>Sem chuva de meteoros ou eclipse cadastrado nesta data. Boa noite para observar constelações e planetas visíveis.</p>';
  }

  campoData.addEventListener('change', mostrarObservacao);
  mostrarObservacao();
}

/* ---------- 4. Fase da lua (guia.html) ----------
   Ciclo sinódico médio de 29,53 dias contados a partir de uma lua
   nova de referência. Precisão de horas, suficiente para planejar
   uma noite de observação. */
const painelLua = document.getElementById('fase-lua');

if (painelLua) {
  const CICLO = 29.530588853;
  const LUA_NOVA_BASE = Date.UTC(2000, 0, 6, 18, 14);

  // Cada linha é o limite superior de idade (em dias) da fase.
  const fases = [
    [1.84,  '●', 'Lua nova',          'Céu escuro: ótimo para galáxias, nebulosas e meteoros.'],
    [5.53,  '◐', 'Crescente côncava', 'Um fio de lua logo após o pôr do sol. Céu ainda escuro.'],
    [9.22,  '◑', 'Quarto crescente',  'Boa fase para crateras: as sombras na Lua ficam longas.'],
    [12.91, '◕', 'Crescente gibosa',  'Lua já forte cedo. Prefira planetas e estrelas duplas.'],
    [16.61, '○', 'Lua cheia',         'Céu claro a noite toda. Melhor para observar a própria Lua.'],
    [20.30, '◔', 'Minguante gibosa',  'A Lua nasce mais tarde: o início da noite volta a escurecer.'],
    [23.99, '◐', 'Quarto minguante',  'Outra ótima fase para relevo lunar, agora de madrugada.'],
    [29.53, '◑', 'Minguante côncava', 'Quase nova. A primeira metade da noite já está no ponto.']
  ];

  const dias = (Date.now() - LUA_NOVA_BASE) / 86400000;
  const idade = ((dias % CICLO) + CICLO) % CICLO;
  const [, simbolo, nome, dica] = fases.find(f => idade < f[0]);

  painelLua.innerHTML =
    `<span class="disco">${simbolo}</span><strong>${nome}</strong>` +
    `<small>${Math.floor(idade)} dias de idade — ${dica}</small>`;
}

/* ---------- 5. API da NASA: imagem astronômica do dia (index.html) ----------
   Passo a passo da requisição:
   1. fetch() envia o pedido para a API e await espera a resposta chegar.
   2. resposta.ok confirma que o servidor respondeu com sucesso (200–299).
   3. resposta.json() transforma o corpo da resposta em objeto JavaScript.
   4. Os dados preenchem o HTML sem recarregar a página.
   5. Se qualquer passo falhar, o catch mostra uma mensagem amigável. */
const campoNasa = document.querySelector('#data-nasa');

if (campoNasa) {
  const botaoNasa     = document.querySelector('#botao-nasa');
  const mensagemNasa  = document.querySelector('#mensagem-nasa');
  const resultadoNasa = document.querySelector('#resultado-nasa');
  const imagemNasa    = document.querySelector('#imagem-nasa');
  const linkNasa      = document.querySelector('#link-nasa');

  // Data local no formato AAAA-MM-DD (a API não aceita datas futuras).
  const hojeLocal = new Date().toLocaleDateString('en-CA');
  campoNasa.max = hojeLocal;
  campoNasa.value = hojeLocal;

  async function buscarDados() {
    mensagemNasa.hidden = true;
    resultadoNasa.hidden = true;
    botaoNasa.disabled = true;
    botaoNasa.textContent = 'Buscando…';

    try {
      if (!campoNasa.value) throw new Error('Data não informada');

      const url = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=' + campoNasa.value;
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error('Erro ' + resposta.status);

      const dados = await resposta.json();

      document.querySelector('#titulo-nasa').textContent = dados.title;
      document.querySelector('#data-exibida-nasa').textContent = dados.date.split('-').reverse().join('/');
      document.querySelector('#descricao-nasa').textContent = dados.explanation;

      // Alguns dias a NASA publica um vídeo em vez de imagem.
      if (dados.media_type === 'image') {
        imagemNasa.src = dados.url;
        imagemNasa.alt = dados.title;
        imagemNasa.hidden = false;
        linkNasa.hidden = true;
      } else {
        imagemNasa.hidden = true;
        linkNasa.href = dados.url;
        linkNasa.hidden = false;
      }

      resultadoNasa.hidden = false;

    } catch (erro) {
      mensagemNasa.textContent =
        'Não foi possível buscar a imagem agora. Confira a data e sua conexão e tente novamente.';
      mensagemNasa.hidden = false;

    } finally {
      botaoNasa.disabled = false;
      botaoNasa.textContent = 'Buscar imagem';
    }
  }

  botaoNasa.addEventListener('click', buscarDados);
  buscarDados();   // já carrega a imagem de hoje ao abrir a página
}