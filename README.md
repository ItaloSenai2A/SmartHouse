# SmartHouse IoT – Dashboard de Automação Residencial

## 📝 Descrição do Projeto
O **SmartHouse IoT** é um sistema de automação residencial desenvolvido para gerenciar dispositivos IoT em diferentes ambientes da casa utilizando **ESP32** e **MQTT**.  
O projeto conta com um **dashboard web responsivo em React + Vite**, que permite o controle e monitoramento em tempo real dos dispositivos conectados.

O objetivo principal é demonstrar **interação em tempo real com dispositivos IoT**, aplicando conceitos de sistemas robustos e comunicação via MQTT.

---

## 🛠 Tecnologias Utilizadas

- **Frontend**: React.js + Vite  
- **Interface**: Bootstrap 5.3  
- **Comunicação IoT**: MQTT via broker público `broker.hivemq.com`  
- **Biblioteca MQTT**: Paho MQTT (WebSockets)  
- **Hardware/Simulação**: ESP32, sensores DHT22 e PIR, LEDs, cortinas e outros atuadores simulados  

---
## 📸Preview
<img width="1380" height="793" alt="Macbook-Air-localhost (3)" src="https://github.com/user-attachments/assets/1db7651a-ad83-4c12-8fd8-7baafa1027ec" />
<img width="436" height="883" alt="iPhone-14-Plus-localhost (1)" src="https://github.com/user-attachments/assets/0909a01c-7123-4279-8fcc-7845b5366869" />

---

## 📋 Funcionalidades Implementadas

### 1️⃣ Conexão e Status
- Conexão com broker MQTT (`broker.hivemq.com`) através de WebSockets.
- Indicador visual de status da conexão (Conectado / Desconectado).
- Botões para conectar/desconectar do broker.

### 2️⃣ Visualização de Sensores
- Painel em tempo real com leitura de:
  - Temperatura (°C) – sensor DHT22
  - Umidade (%) – sensor DHT22
  - Movimento detectado/ausente – sensor PIR da garagem
  - Estado das luzes – Ligado / Desligado

### 3️⃣ Controle e Status dos Dispositivos

**Garagem**
- Porta Social – Abrir / Fechar + indicador de status (Aberta / Fechada)
- Porta Basculante – Abrir / Fechar + indicador de status (Aberta / Fechada)
- Luz da Garagem – Ligar / Desligar + indicador de status (Ligada / Desligada)

**Sala de Estar**
- Luz da Sala – Ligar / Desligar + status (Ligada / Desligada)
- Ar-condicionado – Ligar / Desligar + status (Ligado / Desligado)
- Umidificador – Ligar / Desligar + status (Ligado / Desligado)

**Quarto**
- Luz do Quarto – Ligar / Desligar + status (Ligada / Desligada)
- Tomada Inteligente – Ligar / Desligar + status (Ligada / Desligada)
- Cortina – Abrir / Fechar / Parar + status (Aberta / Fechada / Em movimento)

### 4️⃣ Histórico de Mensagens
- Log simples que exibe as últimas mensagens enviadas e recebidas via MQTT.
- Permite acompanhar o fluxo de comandos e atualizações dos dispositivos em tempo real.

---

## 📦 Estrutura do Projeto

```

SmartHouse-IoT/
│
├─ src/
│  ├─ App.jsx          # Dashboard principal e lógica MQTT
│  ├─ index.jsx        # Entry point do React
│  └─ index.css        # Estilo global do site
│
├─ package.json        # Dependências do projeto
└─ README.md           # Este arquivo

````

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn
- Browser moderno (Chrome, Edge ou Firefox)

### Passo a Passo

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/SmartHouse-IoT.git
cd SmartHouse-IoT
````

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Execute o projeto:

```bash
npm run dev
# ou
yarn dev
```

4. Abra o navegador em `http://localhost:5173` (ou porta exibida no terminal).

5. Interaja com o dashboard:

* Conecte-se ao broker MQTT.
* Controle luzes, cortinas, ar-condicionado e portões.
* Visualize dados de sensores em tempo real.
* Confira o histórico de mensagens.

---

## 🔌 MQTT e Tópicos

| Ambiente | Dispositivo       | Tópico MQTT                                      |
| -------- | ----------------- | ------------------------------------------------ |
| Quarto   | Luz               | `quarto/luz`                                     |
| Quarto   | Tomada            | `quarto/tomada`                                  |
| Quarto   | Cortina           | `quarto/cortina/abrir` / `quarto/cortina/fechar` |
| Sala     | Luz               | `sala/luz`                                       |
| Sala     | Ar-cond.          | `sala/ar`                                        |
| Sala     | Umidificador      | `sala/umidificador`                              |
| Garagem  | Luz               | `garagem/luz/set`                                |
| Garagem  | Portão Social     | `garagem/portaoSocial/set`                       |
| Garagem  | Portão Basculante | `garagem/portaoBasculante/set`                   |
| Geral    | Sensor DHT22      | `sala/dht`                                       |
| Geral    | Sensor PIR        | `garagem/pir`                                    |

> Os comandos MQTT são strings simples como `"ON"`, `"OFF"`, `"abrir"`, `"fechar"`, dependendo do dispositivo.

---

## ⚙️ Personalizações

* Estilo do dashboard é facilmente alterável via `index.css` ou Bootstrap.
* Responsividade garantida para desktops, tablets e smartphones.
* Possível expansão para novos cômodos e dispositivos adicionando cards e tópicos MQTT.

---

## 👩‍💻 Autores

**Emanuelly Lima**,
**Ítalo Francesco** e
**Rayssa Nanclares da Silveira**.
