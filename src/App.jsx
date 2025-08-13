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
  const [temaClaro, setTemaClaro] = useState(false); // Estado para tema
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

  // Definição das cores de acordo com o tema
  const cores = temaClaro
    ? {
        fundo: "#f8fafc",
        texto: "#0f172a",
        card: "#e2e8f0",
        titulo: "#3b82f6",
        led: "#3b82f6",
        off: "#ef4444",
        destaque1: "#8b5cf6",
        destaque2: "#22c55e",
        destaque3: "#f59e0b",
      }
    : {
        fundo: "#0f172a",
        texto: "#f8fafc",
        card: "#1e293b",
        titulo: "#60a5fa",
        led: "#3b82f6",
        off: "#ef4444",
        destaque1: "#8b5cf6",
        destaque2: "#22c55e",
        destaque3: "#f59e0b",
      };

  // Estilo do toggle switch
  const switchStyle = {
    position: "relative",
    display: "inline-block",
    width: "60px",
    height: "34px",
  };
  const sliderStyle = {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: temaClaro ? "#ccc" : "#2196F3",
    transition: ".4s",
    borderRadius: "34px",
  };
  const circleStyle = {
    position: "absolute",
    height: "26px",
    width: "26px",
    left: temaClaro ? "30px" : "4px",
    bottom: "4px",
    backgroundColor: "white",
    transition: ".4s",
    borderRadius: "50%",
  };

  return (
    <div style={{ backgroundColor: cores.fundo, minHeight: "100vh", color: cores.texto }} className="p-4">
      <div className="container">
        {/* Interruptor de tema */}
        <div className="d-flex justify-content-end mb-3">
          <div style={switchStyle} onClick={() => setTemaClaro(!temaClaro)}>
            <div style={sliderStyle}></div>
            <div style={circleStyle}></div>
          </div>
        </div>

        <h1 className="text-center mb-2 fw-bold" style={{ color: cores.titulo }}>
          Administração de Casa Inteligente
        </h1>
        <p className="text-center mb-5">
          Status MQTT:{" "}
          <span style={{ color: mqttConectado ? cores.destaque2 : cores.off }}>
            {mqttConectado ? "Conectado" : "Desconectado"}
          </span>
        </p>

        {/* Monitor DHT22 */}
        <div className="card shadow-lg mb-5 border-0" style={{ backgroundColor: cores.card }}>
          <div className="card-body text-center">
            <h2 className="mb-4" style={{ color: cores.titulo }}>🌡️ Monitor DHT22</h2>
            <p className="fs-5">
              <strong style={{ color: cores.destaque2 }}>Temperatura:</strong> {temp} °C
            </p>
            <p className="fs-5">
              <strong style={{ color: cores.destaque2 }}>Umidade:</strong> {umid} %
            </p>
          </div>
        </div>

        {/* Grid de ambientes */}
        <div className="row g-4">
          {/* Quarto */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-lg h-100 border-0" style={{ backgroundColor: cores.card, borderLeft: `5px solid ${cores.destaque1}` }}>
              <div className="card-body text-center">
                <h3 style={{ color: cores.destaque1 }} className="mb-4">Quarto 🛏️</h3>
                <div className="mb-4">
                  <h5 style={{ color: cores.titulo }}>💡 LED Quarto</h5>
                  <button className="btn" style={{ backgroundColor: cores.led, color: "#fff" }} onClick={() => enviarComando(topicoQuartoLuz, "ON")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: cores.off, color: "#fff" }} onClick={() => enviarComando(topicoQuartoLuz, "OFF")}>Desligar</button>
                </div>
                <div className="mb-4">
                  <h5 style={{ color: cores.titulo }}>🔌 Tomada Quarto</h5>
                  <button className="btn" style={{ backgroundColor: cores.led, color: "#fff" }} onClick={() => enviarComando(topicoQuartoTomada, "ON")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: cores.off, color: "#fff" }} onClick={() => enviarComando(topicoQuartoTomada, "OFF")}>Desligar</button>
                </div>
                <div>
                  <h5 style={{ color: cores.titulo }}>🪟 Cortina</h5>
                  <button className="btn" style={{ backgroundColor: cores.destaque1, color: "#fff" }} onClick={() => enviarComando(topicoQuartoCortinaAbrir, "ON")}>Abrir</button>
                  <button className="btn ms-2" style={{ backgroundColor: "#334155", color: "#fff" }} onClick={() => enviarComando(topicoQuartoCortinaFechar, "ON")}>Fechar</button>
                </div>
              </div>
            </div>
          </div>

          {/* Sala */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-lg h-100 border-0" style={{ backgroundColor: cores.card, borderLeft: `5px solid ${cores.destaque2}` }}>
              <div className="card-body text-center">
                <h3 style={{ color: cores.destaque2 }} className="mb-4">Sala 🛋️</h3>
                <div className="mb-4">
                  <h5 style={{ color: cores.titulo }}>💡 Luz da Sala</h5>
                  <button className="btn" style={{ backgroundColor: cores.led, color: "#fff" }} onClick={() => enviarComando(topicoSalaLuz, "on")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: cores.off, color: "#fff" }} onClick={() => enviarComando(topicoSalaLuz, "off")}>Desligar</button>
                </div>
                <div className="mb-4">
                  <h5 style={{ color: cores.titulo }}>❄️ Ar Condicionado</h5>
                  <button className="btn" style={{ backgroundColor: cores.led, color: "#fff" }} onClick={() => enviarComando(topicoSalaAr, "on")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: cores.off, color: "#fff" }} onClick={() => enviarComando(topicoSalaAr, "off")}>Desligar</button>
                </div>
                <div>
                  <h5 style={{ color: cores.titulo }}>💧 Umidificador</h5>
                  <button className="btn" style={{ backgroundColor: cores.led, color: "#fff" }} onClick={() => enviarComando(topicoSalaUmidificador, "on")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: cores.off, color: "#fff" }} onClick={() => enviarComando(topicoSalaUmidificador, "off")}>Desligar</button>
                </div>
              </div>
            </div>
          </div>

          {/* Garagem */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-lg h-100 border-0" style={{ backgroundColor: cores.card, borderLeft: `5px solid ${cores.destaque3}` }}>
              <div className="card-body text-center">
                <h3 style={{ color: cores.destaque3 }} className="mb-4">Garagem 🚗</h3>
                <div className="mb-4">
                  <h5 style={{ color: cores.titulo }}>💡 Luz da Garagem</h5>
                  <button className="btn" style={{ backgroundColor: cores.led, color: "#fff" }} onClick={() => enviarComando(topicoGaragemLuzSet, "ON")}>Ligar</button>
                  <button className="btn ms-2" style={{ backgroundColor: cores.off, color: "#fff" }} onClick={() => enviarComando(topicoGaragemLuzSet, "OFF")}>Desligar</button>
                </div>
                <div className="mb-4">
                  <h5 style={{ color: cores.titulo }}>🚪 Portão Social</h5>
                  <button className="btn btn-lg" style={{ backgroundColor: cores.destaque1, color: "#fff", padding: "12px 24px" }} onClick={() => enviarComando(topicoGaragemPortaoSocialSet, "abrir")}>Abrir</button>
                </div>
                <div>
                  <h5 style={{ color: cores.titulo }}>🚪 Portão Basculante</h5>
                  <button className="btn" style={{ backgroundColor: cores.destaque1, color: "#fff" }} onClick={() => enviarComando(topicoGaragemPortaoBasculanteSet, "abrir")}>Abrir</button>
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
