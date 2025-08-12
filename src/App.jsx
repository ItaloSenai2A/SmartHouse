// src/App.jsx
import { useEffect, useState, useRef } from "react";
import { Client, Message } from "paho-mqtt";

const brokerUrl = "wss://broker.hivemq.com:8884/mqtt";
const clientId = "webClient-" + Math.floor(Math.random() * 100000);

// Tópicos
const topicoSensorSala = "sala/dht";
const topicoQuartoLuz = "quarto/luz";
const topicoQuartoTomada = "quarto/tomada";
const topicoQuartoCortinaAbrir = "quarto/cortina/abrir";
const topicoQuartoCortinaFechar = "quarto/cortina/fechar";
const topicoSalaLuz = "sala/luz";
const topicoSalaAr = "sala/ar";
const topicoSalaUmidificador = "sala/umidificador";
const topicoGaragemLuzSet = "garagem/luz/set";
const topicoGaragemPortaoSocialSet = "garagem/portaoSocial/set";
const topicoGaragemPortaoBasculanteSet = "garagem/portaoBasculante/set";

function App() {
  const [temp, setTemp] = useState("--");
  const [umid, setUmid] = useState("--");
  const client = useRef(null);

  useEffect(() => {
    client.current = new Client(brokerUrl, clientId);

    client.current.onConnectionLost = (responseObject) => {
      console.error("Conexão perdida:", responseObject.errorMessage);
    };

    client.current.onMessageArrived = (message) => {
      if (message.destinationName === topicoSensorSala) {
        try {
          const dados = JSON.parse(message.payloadString);
          setTemp(dados.temp.toFixed(1));
          setUmid(dados.umid.toFixed(1));
        } catch (e) {
          console.error("Erro ao parsear JSON:", e);
        }
      }
    };

    client.current.connect({
      useSSL: true,
      onSuccess: () => {
        console.log("Conectado ao broker MQTT");
        client.current.subscribe(topicoSensorSala);
      },
      onFailure: (err) => {
        console.error("Falha na conexão MQTT:", err);
      },
    });

    return () => {
      if (client.current && client.current.isConnected()) {
        client.current.disconnect();
      }
    };
  }, []);

  function enviarComando(topico, mensagem) {
    if (!client.current || !client.current.isConnected()) {
      alert("Cliente MQTT não conectado");
      return;
    }
    const msg = new Message(mensagem);
    msg.destinationName = topico;
    client.current.send(msg);
    console.log(`Enviado para ${topico}: ${mensagem}`);
  }

  return (
    <>
      <style>{`
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1f2937, #3b82f6);
          margin: 0;
          padding: 20px;
          color: #e0e7ff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .titulo-principal {
          font-size: 3rem;
          font-weight: 900;
          color: #3b82f6;
          text-align: center;
          margin-bottom: 40px;
          text-shadow: 2px 2px 8px rgba(59, 130, 246, 0.7);
          background: linear-gradient(90deg, #60a5fa, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          user-select: none;
        }
        .medidor {
          background: #111827;
          border-radius: 14px;
          padding: 30px 40px;
          width: 100%;
          max-width: 700px;
          margin: 0 auto 40px auto; /* centralizado horizontalmente */
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.7);
          text-align: center;
        }
        .medidor h1 {
          color: #22c55e;
          margin-bottom: 25px;
          font-weight: 700;
          font-size: 2rem;
        }
        .medidor p {
          font-size: 1.3rem;
          margin: 12px 0;
        }
        .medidor strong {
          color: #a7f3d0;
        }
        .container {
          max-width: 1600px;
          width: 100%;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 48px 60px; /* maior espaço entre cards vertical e horizontal */
          padding: 0 24px; /* respiro nas laterais */
          justify-items: center;
        }
        .card {
          background: #111827;
          border-radius: 14px;
          padding: 30px 25px;
          box-shadow: 0 10px 30px rgba(37, 99, 235, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          min-height: 450px;
          width: 100%;
          max-width: 500px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(37, 99, 235, 0.9);
        }
        h2 {
          color: #60a5fa;
          margin-bottom: 25px;
          font-weight: 700;
          text-align: center;
          font-size: 1.8rem;
          width: 100%;
        }
        h4 {
          color: #93c5fd;
          margin-bottom: 15px;
          font-weight: 600;
          text-align: center;
          width: 100%;
        }
        button {
          background: #2563eb;
          border: none;
          color: white;
          padding: 14px 24px;
          margin: 6px 10px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
          min-width: 130px;
          box-shadow: 0 6px 12px rgba(37, 99, 235, 0.7);
        }
        button:hover {
          background-color: #1d4ed8;
          box-shadow: 0 8px 16px rgba(29, 78, 216, 0.9);
        }
        .controls-section {
          background: #1e293b;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
          width: 100%;
          box-shadow: inset 0 0 12px #2563eb;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        @media (max-width: 700px) {
          button {
            min-width: 100%;
            margin: 8px 0;
          }
        }
      `}</style>

      <header className="titulo-principal">
        Administração de Casa Inteligente
      </header>

      <div className="medidor">
        <h1>🌡️ Monitor DHT22</h1>
        <p><strong>Temperatura:</strong> {temp} °C</p>
        <p><strong>Umidade:</strong> {umid} %</p>
      </div>

      <div className="container">
        {/* Quarto */}
        <div className="card">
          <h2>Quarto 🛏️</h2>
          <div className="controls-section">
            <h4>💡 LED Quarto</h4>
            <button onClick={() => enviarComando(topicoQuartoLuz, "ON")}>Ligar</button>
            <button onClick={() => enviarComando(topicoQuartoLuz, "OFF")}>Desligar</button>
          </div>
          <div className="controls-section">
            <h4>🔌 Tomada Quarto</h4>
            <button onClick={() => enviarComando(topicoQuartoTomada, "ON")}>Ligar</button>
            <button onClick={() => enviarComando(topicoQuartoTomada, "OFF")}>Desligar</button>
          </div>
          <div className="controls-section">
            <h4>🪟 Cortina</h4>
            <button onClick={() => enviarComando(topicoQuartoCortinaAbrir, "ON")}>Abrir</button>
            <button onClick={() => enviarComando(topicoQuartoCortinaFechar, "ON")}>Fechar</button>
          </div>
        </div>

        {/* Sala */}
        <div className="card">
          <h2>Sala 🛋️</h2>
          <div className="controls-section">
            <h4>💡 Luz da Sala</h4>
            <button onClick={() => enviarComando(topicoSalaLuz, "on")}>Ligar</button>
            <button onClick={() => enviarComando(topicoSalaLuz, "off")}>Desligar</button>
          </div>
          <div className="controls-section">
            <h4>❄️ Ar Condicionado</h4>
            <button onClick={() => enviarComando(topicoSalaAr, "on")}>Ligar</button>
            <button onClick={() => enviarComando(topicoSalaAr, "off")}>Desligar</button>
          </div>
          <div className="controls-section">
            <h4>💧 Umidificador</h4>
            <button onClick={() => enviarComando(topicoSalaUmidificador, "on")}>Ligar</button>
            <button onClick={() => enviarComando(topicoSalaUmidificador, "off")}>Desligar</button>
          </div>
        </div>

        {/* Garagem */}
        <div className="card">
          <h2>Garagem 🚗</h2>
          <div className="controls-section">
            <h4>💡 Luz da Garagem</h4>
            <button onClick={() => enviarComando(topicoGaragemLuzSet, "ON")}>Ligar</button>
            <button onClick={() => enviarComando(topicoGaragemLuzSet, "OFF")}>Desligar</button>
          </div>
          <div className="controls-section portao-social">
            <h4>🚪 Portão Social</h4>
            <button onClick={() => enviarComando(topicoGaragemPortaoSocialSet, "abrir")}>Abrir</button>
          </div>
          <div className="controls-section">
            <h4>🚪 Portão Basculante</h4>
            <button onClick={() => enviarComando(topicoGaragemPortaoBasculanteSet, "abrir")}>Abrir</button>
            <button onClick={() => enviarComando(topicoGaragemPortaoBasculanteSet, "fechar")}>Fechar</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
