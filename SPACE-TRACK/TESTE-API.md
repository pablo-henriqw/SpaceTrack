# Teste da API — SpaceTrack

## API utilizada
NASA Astronomy Picture of the Day (APOD): https://api.nasa.gov/planetary/apod

## O que a funcionalidade faz
- Usa `async function` e `fetch()` para consultar a API.
- Converte a resposta com `resposta.json()`.
- Atualiza o título, data, descrição e imagem no DOM sem recarregar a página.
- Usa `try/catch` e mostra uma mensagem amigável em caso de falha.

## Testes para registrar na entrega
1. **Cenário válido:** deixe a data de hoje e clique em **Buscar imagem**. A imagem e os dados da NASA devem aparecer.
2. **Cenário inválido:** tente informar uma data futura. O campo limita a seleção até hoje; para testar a falha, remova temporariamente `dataNasa.max = hojeISO;` no JavaScript e escolha uma data futura. A página deve exibir a mensagem amigável de erro. Depois, restaure a linha.

Observação: a API usa a chave pública de demonstração `DEMO_KEY`, que possui limite de requisições. Se o limite for atingido, tente novamente mais tarde.
