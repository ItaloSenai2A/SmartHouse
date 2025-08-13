// src/App.jsx
import { useEffect, useState, useRef } from "react";
import { Client, Message } from "paho-mqtt";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";

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
  const [mqttConectado, setMqttConectado] = useState(false);
  const client = useRef(null);

  const conectarMQTT = () => {
    client.current = new Client(brokerUrl, clientId);

    client.current.onConnectionLost = () => {
      console.warn("Conexão perdida. Tentando reconectar...");
      setMqttConectado(false);
      setTimeout(conectarMQTT, 2000);
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
        setMqttConectado(true);
        client.current.subscribe(topicoSensorSala);
      },
      onFailure: (err) => {
        console.error("Falha na conexão MQTT:", err);
        setMqttConectado(false);
        setTimeout(conectarMQTT, 2000);
      },
    });
  };

  useEffect(() => {
    conectarMQTT();
    return () => {
      if (client.current && client.current.isConnected()) {
        client.current.disconnect();
      }
    };
  }, []);

  function enviarComando(topico, mensagem) {
    if (!mqttConectado) {
      alert("Cliente MQTT não conectado");
      return;
    }
    const msg = new Message(mensagem);
    msg.destinationName = topico;
    client.current.send(msg);
    console.log(`Enviado para ${topico}: ${mensagem}`);
  }

  return (
    <div style={{ backgroundColor: "#0f172a", minHeight: "100vh" }} className="text-light p-4">
      <div className="container">
        <h1 className="text-center mb-2 fw-bold" style={{ color: "#60a5fa" }}>
          Administração de Casa Inteligente
        </h1>
        <p className="text-center mb-5">
          Status MQTT:{" "}
          <span style={{ color: mqttConectado ? "#22c55e" : "#ef4444" }}>
            {mqttConectado ? "Conectado" : "Desconectado"}
          </span>
        </p>

        {/* Monitor DHT22 */}
        <div className="card text-light shadow-lg mb-5 border-0" style={{ backgroundColor: "#1e293b" }}>
          <div className="card-body text-center">
            <h2 className="mb-4" style={{ color: "#60a5fa" }}>🌡️ Monitor DHT22</h2>
            <p className="fs-5">
              <strong style={{ color: "#22c55e" }}>Temperatura:</strong> {temp} °C
            </p>
            <p className="fs-5">
              <strong style={{ color: "#22c55e" }}>Umidade:</strong> {umid} %
            </p>
          </div>
        </div>

        {/* Grid de ambientes */}
        <div className="row g-4">
          {/* Quarto */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-lg h-100 border-0" style={{ backgroundColor: "#1e293b", borderLeft: "5px solid #8b5cf6" }}>
              <div className="card-body text-center">
                <h3 style={{ color: "#8b5cf6" }} className="mb-4">Quarto 🛏️</h3>
                <div className="mb-4">
                  <h5 style={{ color: "#60a5fa" }}>💡 LED Quarto</h5>
                  <button className="btn" style={{ backgroundColor: "#3b82f6", color: "#fff" }} onClick={() => enviarComando(topicoQuartoLuz, "ON")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: "#ef4444", color: "#fff" }} onClick={() => enviarComando(topicoQuartoLuz, "OFF")}>Desligar</button>
                </div>
                <div className="mb-4">
                  <h5 style={{ color: "#60a5fa" }}>🔌 Tomada Quarto</h5>
                  <button className="btn" style={{ backgroundColor: "#3b82f6", color: "#fff" }} onClick={() => enviarComando(topicoQuartoTomada, "ON")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: "#ef4444", color: "#fff" }} onClick={() => enviarComando(topicoQuartoTomada, "OFF")}>Desligar</button>
                </div>
                <div>
                  <h5 style={{ color: "#60a5fa" }}>🪟 Cortina</h5>
                  <button className="btn" style={{ backgroundColor: "#8b5cf6", color: "#fff" }} onClick={() => enviarComando(topicoQuartoCortinaAbrir, "ON")}>Abrir</button>
                  <button className="btn ms-2" style={{ backgroundColor: "#334155", color: "#fff" }} onClick={() => enviarComando(topicoQuartoCortinaFechar, "ON")}>Fechar</button>
                </div>
              </div>
            </div>
          </div>

          {/* Sala */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-lg h-100 border-0" style={{ backgroundColor: "#1e293b", borderLeft: "5px solid #22c55e" }}>
              <div className="card-body text-center">
                <h3 style={{ color: "#22c55e" }} className="mb-4">Sala 🛋️</h3>
                <div className="mb-4">
                  <h5 style={{ color: "#60a5fa" }}>💡 Luz da Sala</h5>
                  <button className="btn" style={{ backgroundColor: "#3b82f6", color: "#fff" }} onClick={() => enviarComando(topicoSalaLuz, "on")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: "#ef4444", color: "#fff" }} onClick={() => enviarComando(topicoSalaLuz, "off")}>Desligar</button>
                </div>
                <div className="mb-4">
                  <h5 style={{ color: "#60a5fa" }}>❄️ Ar Condicionado</h5>
                  <button className="btn" style={{ backgroundColor: "#3b82f6", color: "#fff" }} onClick={() => enviarComando(topicoSalaAr, "on")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: "#ef4444", color: "#fff" }} onClick={() => enviarComando(topicoSalaAr, "off")}>Desligar</button>
                </div>
                <div>
                  <h5 style={{ color: "#60a5fa" }}>💧 Umidificador</h5>
                  <button className="btn" style={{ backgroundColor: "#3b82f6", color: "#fff" }} onClick={() => enviarComando(topicoSalaUmidificador, "on")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: "#ef4444", color: "#fff" }} onClick={() => enviarComando(topicoSalaUmidificador, "off")}>Desligar</button>
                </div>
              </div>
            </div>
          </div>

          {/* Garagem */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-lg h-100 border-0" style={{ backgroundColor: "#1e293b", borderLeft: "5px solid #f59e0b" }}>
              <div className="card-body text-center">
                <h3 style={{ color: "#f59e0b" }} className="mb-4">Garagem 🚗</h3>
                <div className="mb-4">
                  <h5 style={{ color: "#60a5fa" }}>💡 Luz da Garagem</h5>
                  <button className="btn" style={{ backgroundColor: "#3b82f6", color: "#fff" }} onClick={() => enviarComando(topicoGaragemLuzSet, "ON")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: "#ef4444", color: "#fff" }} onClick={() => enviarComando(topicoGaragemLuzSet, "OFF")}>Desligar</button>
                </div>
                <div className="mb-4">
                  <h5 style={{ color: "#60a5fa" }}>🚪 Portão Social</h5>
                  <button className="btn btn-lg" style={{ backgroundColor: "#8b5cf6", color: "#fff", padding: "12px 24px" }} onClick={() => enviarComando(topicoGaragemPortaoSocialSet, "abrir")}>Abrir</button>
                </div>
                <div>
                  <h5 style={{ color: "#60a5fa" }}>🚪 Portão Basculante</h5>
                  <button className="btn" style={{ backgroundColor: "#8b5cf6", color: "#fff" }} onClick={() => enviarComando(topicoGaragemPortaoBasculanteSet, "abrir")}>Abrir</button>
                  <button className="btn ms-2" style={{ backgroundColor: "#334155", color: "#fff" }} onClick={() => enviarComando(topicoGaragemPortaoBasculanteSet, "fechar")}>Fechar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}

export default App;
