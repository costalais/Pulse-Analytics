# 🎀 Pulse Analytics — Dashboard de Indicadores Cambiais

Dashboard interativo de indicadores cambiais desenvolvido com **HTML5, CSS3 e JavaScript**, com uma interface responsiva em tons de rosa e rosé. O projeto consome dados de uma API externa para apresentar cotações, histórico de variações e conversão de moedas.


## ✨ Funcionalidades

* 📊 **Indicadores cambiais:** cotação, variação percentual, máxima e mínima do período.
* 📈 **Gráfico interativo:** visualização do histórico de cotações com Chart.js.
* 💱 **Conversor de moedas:** conversão de valores entre diferentes moedas.
* 🔎 **Filtros dinâmicos:** seleção de moeda-base e moeda de comparação.
* 🔄 **Atualização de dados:** novas consultas à API sob demanda.
* ⚠️ **Tratamento de estados:** carregamento, falhas de requisição e dados indisponíveis.
* 📱 **Layout responsivo:** adaptação para computadores, tablets e celulares.
* 🎨 **Interface personalizada:** identidade visual em rosa e rosé, com foco em usabilidade e legibilidade.

## 🛠️ Tecnologias utilizadas

| Tecnologia      | Aplicação                                           |
| --------------- | --------------------------------------------------- |
| HTML5           | Estrutura semântica da aplicação                    |
| CSS3            | Estilização, Flexbox, Grid e responsividade         |
| JavaScript ES6+ | Lógica, eventos e atualização dinâmica da interface |
| Fetch API       | Requisições HTTP assíncronas                        |
| API REST        | Consulta de taxas de câmbio                         |
| Chart.js        | Construção do gráfico histórico                     |

## 🌐 API utilizada

O projeto utiliza a API pública **[Frankfurter](https://www.frankfurter.app/)** para consultar taxas de câmbio de referência.

As requisições são realizadas com `fetch()` e `async/await`, com tratamento de erros para situações em que a consulta não pode ser concluída.

> **Nota:** as taxas são de referência e podem não refletir cotações em tempo real. A disponibilidade e a data dos dados dependem da API.

## 🚀 Como executar o projeto

### Pré-requisitos

* Navegador atualizado.
* Visual Studio Code ou outro editor de código.
* Conexão com a internet.

### Passo a passo

1. Clone o repositório:

   ```bash
   git clone https://github.com/costalais/Pulse-Analytics.git
   ```

2. Entre na pasta:

   ```bash
   cd pulse-dashboard
   ```

3. Abra a pasta no Visual Studio Code.

4. Execute o arquivo `index.html` usando a extensão **Live Server**.

5. Acesse o endereço local disponibilizado pelo Live Server.

A aplicação não exige instalação de dependências via npm nem configuração de chave de API. As bibliotecas e fontes externas são carregadas por CDN.

## 📂 Estrutura do projeto

```text
pulse-dashboard/
├── index.html    # Estrutura da aplicação
├── style.css     # Estilos e layout responsivo
├── app.js        # Integração com API e funcionalidades
└── README.md     # Documentação do projeto
```


## 🎯 Objetivo do projeto

Este projeto foi desenvolvido para praticar e demonstrar conhecimentos em desenvolvimento front-end, consumo de APIs REST, manipulação assíncrona de dados, visualização de informações e construção de interfaces responsivas.
