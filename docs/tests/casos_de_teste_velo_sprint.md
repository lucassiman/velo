# Casos de Teste - Velô Sprint (Configurador de Veículo Elétrico)

Este documento contém os casos de teste funcionais para validação dos fluxos do sistema Velô Sprint, conforme diretrizes fornecidas.

---

### CT01 - Acessar a Landing Page com sucesso

#### Objetivo
Garantir que a Landing Page do Velô Sprint seja carregada corretamente e exiba as informações iniciais e opções de navegação.

#### Pré-Condições
- O sistema deve estar no ar e acessível via navegador web.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Acessar a URL inicial do sistema | A página carrega sem erros, exibindo banner principal e botões de ação ("Configurar", etc.) |
| 2  | Clicar no botão para iniciar configuração do veículo | O usuário é redirecionado para o Módulo Configurador de Veículo |

#### Resultados Esperados
- O usuário visualiza o conteúdo da página inicial e consegue iniciar a jornada de compra/configuração sem dificuldades.

#### Critérios de Aceitação
- A página principal carrega corretamente.
- Botão "Configurar" ou similar deve estar presente e redirecionar corretamente.

---

### CT02 - Configurador: Validação de regras de precificação dinâmica ao selecionar opcionais

#### Objetivo
Validar se o cálculo do preço final do carro altera corretamente de acordo com as regras de opcionais: Base (R$ 40.000), Sport (+R$ 2.000), Precision Park (+R$ 5.500) e Flux Capacitor (+R$ 5.000).

#### Pré-Condições
- Estar na página do Configurador de Veículo.
- Preço base visível.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Iniciar a configuração com o modelo padrão. | O valor total exibido deve ser R$ 40.000. |
| 2  | Selecionar a opção de rodas "Sport". | O valor total exibido é atualizado para R$ 42.000. |
| 3  | Adicionar a opção "Precision Park". | O valor total exibido é atualizado para R$ 47.500. |
| 4  | Adicionar a opção "Flux Capacitor". | O valor total exibido é atualizado para R$ 52.500. |
| 5  | Remover a opção rodas "Sport". | O valor total exibido cai para R$ 50.500. |

#### Resultados Esperados
- O sistema atualiza o valor total dinamicamente e com exatidão a cada componente selecionado ou desmarcado.

#### Critérios de Aceitação
- Preço base do carro: R$ 40.000.
- Adição correta de cada componente.
- Subtração correta ao desmarcar um componente.

---

### CT03 - Configurador: Simulação de financiamento com juros compostos de 2% ao mês em 12x

#### Objetivo
Testar a fórmula de cálculo financeiro exibido na simulação de parcelamento, confirmando que inclui a trava de 12x e os juros compostos de 2%.

#### Pré-Condições
- Estar na página do Configurador em um veículo de R$ 40.000 (sem opcionais).
- Opção de pagamento em financiamento disponível.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Selecionar método de pagamento "Parcelado / Financiamento". | Sistema exibe formulário ou slider para inserção do valor de entrada. |
| 2  | Preencher com valor de entrada R$ 0. | O saldo devedor é estipulado em R$ 40.000. |
| 3  | Clicar em "Simular" ou verificar o resumo gerado automaticamente. | O sistema deve simular 12x com juros compostos de 2% a.m em cima de R$ 40.000 (Parcelas de aprox. R$ 3.782,36). |

#### Resultados Esperados
- Cálculo de parcelamento realizado apenas em 12 vezes e utilizando as taxas descritas.

#### Critérios de Aceitação
- Total a pagar e o valor das parcelas devem refletir exatamente um CET (Custo Efetivo) de 2% a.m compostos sobre o saldo restante em 12 meses.
- Não deve ser possível escolher uma quantidade diferente de 12 parcelas.

---

### CT04 - Checkout: Tentativa de avanço com campos obrigatórios em branco

#### Objetivo
Verificar se validações do formulário estão impedindo a finalização do pedido com dados incompletos.

#### Pré-Condições
- Ter um veículo configurado e avançar para a tela de Checkout.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Na tela de Checkout, deixar completamente em branco campos como Nome, CPF, e-mail. | Formulário permanece em branco. |
| 2  | Tentar clicar no botão de "Finalizar Compra" ou Continuar. | Sistema bloqueia o avanço e exibe mensagens de erro em vermelho nos campos obrigatórios não preenchidos. |

#### Resultados Esperados
- O sistema não permite a gravação do pedido, retendo o cliente na mesma página até correção.

#### Critérios de Aceitação
- Mensagens indicativas nos respectivos campos faltantes.
- Nenhuma requisição à API de crédito é disparada nesse passo vazio.

---

### CT05 - Análise de Crédito: Usuário aprovado com Score > 700

#### Objetivo
Validar fluxo de aprovação automática via análise de crédito para usuários considerados bons pagadores (Score maior que 700).

#### Pré-Condições
- Carro configurado (Ex: Total R$ 40.000) e simulação via financiamento preenchida.
- Inserir no Checkout um CPF válido associado a cliente com Score > 700 na API simulada no mock (ex. 750).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Preencher dados do checkout com CPF de Score Alto e clicar em "Finalizar Pedido". | Sistema dispara requisição à API de crédito. |
| 2  | Aguardar retorno da tela. | O sistema deve exibir tela "Aprovado / Confirmação", mostrando resultado Aprovado. |

#### Resultados Esperados
- O usuário encerra o fluxo e visualiza a tela de Confirmação com status de "Aprovado".

#### Critérios de Aceitação
- Status do pedido salvo no banco como Célere/Aprovado.
- Exibição de Resumo de pedido concluído.

---

### CT06 - Análise de Crédito: Usuário Em Análise (Score 501 a 700)

#### Objetivo
Validar que usuários com score médio (501 a 700) são encaminhados para Análise Manual ou status pendente.

#### Pré-Condições
- Carro configurado. Inserir CPF vinculado a retorno de Score mediano na API (Ex. Score 600).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Finalizar checkout com CPF de score 600. | Requisição processada. |
| 2  | Verificar a tela de resultado. | O status do pedido gerado exibe "Em análise". |

#### Resultados Esperados
- O pedido não é aprovado nem rejeitado no momento, aguardando status secundário.

#### Critérios de Aceitação
- A tela de finalização deve instruir que um representante entrará em contato ou o status está pendente de análise interna.

---

### CT07 - Análise de Crédito: Usuário Reprovado com Score <= 500

#### Objetivo
Validar que usuários com score baixo (<= 500) tenham seus pedidos de financiamento reprovados na base.

#### Pré-Condições
- Carro configurado. Inserir CPF vinculado a um Score Baixo (Ex. Score 450).
- Compra via financiamento com entrada inferior a 50%.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Finalizar checkout com CPF Reprovável e clicar "Finalizar Pedido" | Requisição finalizada. |
| 2  | Verificar a tela de resultado. | A tela do checkout deve exibir clara notificação de "Crédito Reprovado" e não fornecer número de pedido concluído. |

#### Resultados Esperados
- O sistema retém ou cancela o andamento do pedido, informando ao usuário sobre a impossibilidade da venda parcelada no momento.

#### Critérios de Aceitação
- Status "Reprovado" exposto.

---

### CT08 - Análise de Crédito: Exceção na Aprovação - Entrada >= 50%

#### Objetivo
Validar a regra que determina que o cliente seja automaticamente aprovado caso dê entrada maior ou igual a metade (50%) do valor total, mesmo tendo um Score ruim (baixo).

#### Pré-Condições
- Criar a simulação com um carro de Total R$ 50.000.
- Digitar um CPF com Score Reprovável pela API (Ex: Score 400).
- Selecionar método de pagamento Financiamento.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | No campo de entrada, inserir o valor de R$ 25.000 (ou seja, 50% ou mais). | Valor reconhecido no simulador. |
| 2  | Preencher dados restantes e Finalizar Pedido. | Sistema avalia a regra da entrada. |
| 3  | Verificar o resultado na tela Final/Confirmação. | Sistema deve aprovar o pedido independentemente do score daquele cliente. |

#### Resultados Esperados
- Cliente aprova sua compra mesmo com API de análise de crédito teórica sugerindo reprovação.

#### Critérios de Aceitação
- Compra Aprovada para entrada >= 50% sem validação de limite mínimo de credit score.

---

### CT09 - Consulta de Pedidos: Visualização Segura por Order Number

#### Objetivo
Garantir que os usuários possam consultar seus pedidos anteriores informando o respectivo identificador ou número de pedido, prevenindo visualização de pedidos de terceiros aleatoriamente.

#### Pré-Condições
- O sistema possui um pedido aprovado gravado cuja chave seja o número do pedido (Ex: `ORD-12345`).
- Estar na tela de Consulta de Pedidos.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Carregar tela de rastreamento/consulta. | É apresentado um campo de busca por número de pedido (`order_number`). |
| 2  | Tentar buscar um pedido vazio. | Sistema avisa "Informe um número de pedido válido". |
| 3  | Digitar o número de pedido correto `ORD-12345` e buscar. | O sistema exibe o painel com os detalhes restritos desse pedido àquele número. |

#### Resultados Esperados
- Consulta eficaz que barra pesquisas em branco ou inválidas.

#### Critérios de Aceitação
- O input de consulta exige o envio de uma string e trata erros em caso de busca de itens que não existem.
- Dados retornam apenas aquele documento (status, detalhes do veículo).
