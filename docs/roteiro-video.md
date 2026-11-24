# Roteiro do vídeo — Central de Ocorrências · Elevadores (até 3 min)

**Antes de gravar**
- Abra https://guilhermegor.github.io/central-ocorrencias-elevadores/ em janela anônima, com zoom em 110 a 125%.
- Vá em **Painel → Restaurar dados de exemplo** para começar do estado conhecido (60 ocorrências).
- Grave a tela com a narração. Não mostre RMs nem e-mail no vídeo nem na descrição.

| Tempo | Tela / ação | Fala |
|---|---|---|
| 0:00–0:20 | Fila aberta, sem clicar em nada | "Somos o Grupo 79, e esta é a Central de Ocorrências de Elevadores. Hoje os chamados de falha técnica, falta de energia, passageiro preso e solicitação de cliente chegam por telefone, e-mail e aplicativo, sem uma base única. Resultado: o urgente espera atrás do rotineiro, e a gestão não enxerga quais elevadores falham sempre." |
| 0:20–0:45 | Percorra a fila devagar e aponte as cores da borda | "A fila centraliza tudo. As ativas vêm primeiro, ordenadas por prioridade. A prioridade é definida pelo tipo: passageiro preso é sempre crítica, falha técnica e falta de energia são altas, e solicitação de cliente é baixa." |
| 0:45–1:05 | Filtro **Prioridade = Alta**; aponte dois cards do mesmo elevador | "Dentro da mesma prioridade, o desempate é a reincidência. O elevador com mais ocorrências no histórico é atendido antes, e só depois conta o tempo de espera. Mas a reincidência nunca passa à frente de um passageiro preso." Depois, volte o filtro para **Todos**. |
| 1:05–1:40 | **Nova ocorrência**: Elevador → Tipo = Passageiro preso (mostre "Prioridade calculada: Crítica") → Descrição "Pessoa presa entre andares, interfone ok" → Reportado por "Portaria" → **Registrar** | "Para registrar, o atendente escolhe o elevador e o tipo, e o sistema já mostra a prioridade calculada antes de salvar. Os campos são validados." Ao salvar: "A ocorrência ganhou um código e foi direto para o topo da fila." |
| 1:40–2:05 | No card novo: **Técnico disponível** → **Despachar**; depois **Marcar como resolvida** | "O despacho mostra só os técnicos livres. Ao despachar, a ocorrência passa para em atendimento, e o técnico sai da lista de disponíveis até resolver. Ao concluir, ela vai para o histórico, com os horários registrados." |
| 2:05–2:45 | **Painel**: indicadores, depois os gráficos, terminando em **Elevadores reincidentes** | "No painel gerencial: total no período, ativas agora, críticas ativas e os tempos médios até o despacho e até a resolução. A distribuição por tipo, prioridade, status e técnico mostra onde está a carga. E a lista de elevadores reincidentes, com oito ou mais ocorrências, aponta onde a manutenção preventiva deve agir primeiro." |
| 2:45–3:00 | Volte para a Fila | "É um MVP em React com dados de exemplo no navegador, publicado no GitHub Pages, com testes automatizados e versão em JavaScript puro. O próximo passo é ligar a uma base real e ao aplicativo dos técnicos. Obrigado!" |

**Depois de gravar**
1. Publique o vídeo como público ou não listado no YouTube, conferindo que abre sem login.
2. Rode `bin/gerar_entrega.sh "<link do vídeo>"`.
3. Envie `Grupo79-Challenge-OTIS-Sprint2.zip` no portal até sexta, 27/11, às 23:59.
