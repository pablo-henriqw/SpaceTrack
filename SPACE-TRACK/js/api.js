const API = 'http://localhost:5000/eventos';

const formulario  = document.querySelector('#form-evento');
const lista       = document.querySelector('#lista-eventos');
const mensagem    = document.querySelector('#mensagem-api');
const tituloLista = document.querySelector('#titulo-lista');

function mostrarMensagem(texto) {
  mensagem.textContent = texto;
  mensagem.hidden = false;
}

/* GET: devolve o array de eventos do banco */
async function listarRegistros() {
  const resposta = await fetch(API);
  if (!resposta.ok) throw new Error('Erro ' + resposta.status);
  return await resposta.json();
}

/* POST: envia um evento novo em JSON */
async function cadastrarRegistro(dados) {
  const resposta = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  const corpo = await resposta.json();
  if (!resposta.ok) throw new Error(corpo.erro || 'Erro ' + resposta.status);
  return corpo;
}

/* Monta um cartão na tela para cada evento */
function criarCartao(evento) {
  const cartao = document.createElement('article');
  cartao.className = 'cartao';

  const data = document.createElement('span');
  data.className = 'data-tag';
  data.textContent = evento.data_evento.split('-').reverse().join('/');

  const titulo = document.createElement('h3');
  titulo.textContent = evento.titulo;

  const descricao = document.createElement('p');
  descricao.textContent = evento.descricao;

  cartao.append(data, titulo, descricao);
  return cartao;
}

async function carregarEventos() {
  try {
    const eventos = await listarRegistros();

    tituloLista.textContent = 'Eventos na agenda (' + eventos.length + ')';
    lista.replaceChildren(...eventos.map(criarCartao));

    if (eventos.length === 0) {
      lista.textContent = 'Nenhum evento cadastrado ainda.';
    }
  } catch (erro) {
    mostrarMensagem('Não foi possível carregar os eventos. Verifique se a API Flask está rodando.');
  }
}

/* Formulário de cadastro */
formulario.addEventListener('submit', async function (evento) {
  evento.preventDefault();

  const dados = {
    titulo:      document.querySelector('#titulo').value,
    data_evento: document.querySelector('#data-evento').value,
    descricao:   document.querySelector('#descricao').value
  };

  try {
    await cadastrarRegistro(dados);
    formulario.reset();
    mostrarMensagem('Evento cadastrado com sucesso!');
    await carregarEventos();

  } catch (erro) {
    const motivo = erro instanceof TypeError
      ? 'A API não respondeu. Verifique se o Flask está rodando.'
      : erro.message;
    mostrarMensagem('Não foi possível cadastrar: ' + motivo);
  }
});

carregarEventos();