# Regras de negócio e decisões de modelagem

## Triagem (prioridade)

O tipo da ocorrência define a prioridade inicial (`domain/priority.ts`):

| Tipo | Prioridade | Por quê |
|---|---|---|
| Passageiro preso | Crítica | Evento de segurança: sempre no topo da fila |
| Interrupção de energia | Alta | Pode prender pessoas em vários elevadores do prédio |
| Falha técnica | Alta | Equipamento parado ou inseguro |
| Outro | Média | Precisa de análise humana |
| Solicitação de cliente | Baixa | Pedido administrativo ou preventivo |

A fila ordena por prioridade (mais urgente primeiro, definida pelo tipo). Dentro da mesma
prioridade, vem primeiro o elevador mais reincidente (mais ocorrências na base inteira,
abertas ou encerradas, independentemente do filtro aplicado na tela) e, depois, quem espera
há mais tempo. A reincidência só desempata: um passageiro preso em um elevador sem
histórico continua acima de uma falha técnica no elevador mais problemático. Ocorrências encerradas vêm depois, da mais recente para a mais
antiga.

## Ciclo de vida

`Aberta → Em atendimento → Resolvida`. Só uma ocorrência aberta pode ser despachada, e só
uma em atendimento pode ser resolvida. Assim os indicadores de tempo até o despacho e tempo
até a resolução sempre têm os carimbos de data de que precisam. Um técnico fica disponível
enquanto não estiver atribuído a nenhuma ocorrência em atendimento.

Os códigos `OC-0001`, `OC-0002`, … são o identificador que o operador lê ao telefone.
Datas são guardadas como texto ISO-8601 para sobreviver à ida e volta em JSON.

## Base de dados fake (localStorage)

- A base é gerada de forma **determinística** (PRNG mulberry32 com semente fixa): a mesma
  semente e o mesmo instante produzem os mesmos registros, para a equipe, a banca e os
  testes. O PRNG não é criptográfico — serve só para dados de exemplo.
- Uma distribuição uniforme em 30 dias deixaria a fila ao vivo praticamente vazia, então
  10 das 60 ocorrências são abertas nas últimas 6 horas (abertas ou em atendimento); as
  demais formam o histórico (resolvidas ou canceladas).
- Falhas técnicas e solicitações são mais frequentes que eventos de segurança, como numa
  central real. Os três primeiros elevadores são sorteados com mais peso para aparecerem
  como reincidentes no painel.
- As chaves do localStorage têm versão (`central-ocorrencias:v1:*`). Ao mudar o formato
  salvo, suba a versão: os dados antigos passam a ser ignorados e a base é recriada. Um
  valor ausente, corrompido ou que não seja lista também provoca a recriação.
- Trocar o localStorage por uma API real significa escrever outro adaptador para as mesmas
  duas portas (`IncidentRepository`, `ReferenceDataRepository`).

## Painel gerencial

Todos os indicadores são funções puras da lista de ocorrências (`application/metrics.ts`).
Um elevador com 8 ou mais ocorrências no período aparece como reincidente — candidato a
modernização.
