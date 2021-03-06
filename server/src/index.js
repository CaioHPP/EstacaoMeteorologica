import express from "express";
import moment from "moment";
import bodyParser from "body-parser";
import initModels from "../models/init-models.js";
import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import Temperatura from "../models/Temperatura.js";
import Pressao from "../models/Pressao.js";
import Altitude from "../models/Altitude.js";
import VelocidadeVento from "../models/VelocidadeVento.js";
import DirecaoVento from "../models/DirecaoVento.js";
import Precipitacao from "../models/Precipitacao.js";
import UmidadeSolo from "../models/UmidadeSolo.js";
import UmidadeRelativa from "../models/UmidadeRelativa.js";

const sequelize = new Sequelize({
  storage: "./db/database.db",
  dialect: "sqlite",
  logging: console.log,
  models: "./models",
});

const models = initModels(sequelize);

const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, GET"
  );
  next();
});

app.get("/test", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send("Conexão estabelecida com o banco de dados.");
  } catch (error) {
    res.send("Erro na comunicação com o banco de dados: " + error);
  }
});

app.get("/sync", async (req, res) => {
  try {
    await sequelize.sync({ force: true });
    res.send("Banco de dados sincronizado.");
  } catch (error) {
    res.send("Erro na sincronização do banco de dados: " + error);
  }
});

app.get("/popularDB", async (req, res) => {
  try {
    await sequelize.sync({ force: true });
    let __dirname = path.resolve();
    const query = fs
      .readFileSync(path.join(__dirname, "../sql/populate.sql"))
      .toString();
    let querys = query.split(";");
    querys.forEach(async (query) => {
      await sequelize.query(query, { raw: true });
    });
    res.send("Banco de dados populado.");
  } catch (error) {
    res.send("Erro na população do banco de dados: " + error);
  }
});

app.get("/leitura/recentes", async (req, res) => {
  const leituras = await models.Leitura.findAll({
    limit: 30,
    include: [
      {
        model: Temperatura,
        as: "Temperatura",
        required: true,
      },
      {
        model: Pressao,
        as: "Pressao",
        required: true,
      },
      {
        model: Altitude,
        as: "Altitude",
        required: true,
      },
      {
        model: VelocidadeVento,
        as: "VelocidadeVento",
        required: true,
      },
      {
        model: DirecaoVento,
        as: "DirecaoVento",
        required: true,
      },
      {
        model: Precipitacao,
        as: "Precipitacao",
        required: true,
      },
      {
        model: UmidadeSolo,
        as: "UmidadeSolo",
        required: true,
      },
      {
        model: UmidadeRelativa,
        as: "UmidadeRelativa",
        required: true,
      },
    ],
    order: [["id", "DESC"]],
  });
  res.json(leituras);
});

app.get("/leitura/filtrado", async (req, res) => {
  let datamin = req.query.datamin;
  let datamax = req.query.datamax;
  if (moment(datamin).isValid() && moment(datamax).isValid()) {
    datamin = moment(datamin).format("x");
    datamax = moment(datamax).format("x");
    const leitura = await models.Leitura.findAll({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: datamin,
          [Sequelize.Op.lt]: datamax,
        },
      },
      include: [
        {
          model: Temperatura,
          as: "Temperatura",
          required: true,
        },
        {
          model: Pressao,
          as: "Pressao",
          required: true,
        },
        {
          model: Altitude,
          as: "Altitude",
          required: true,
        },
        {
          model: VelocidadeVento,
          as: "VelocidadeVento",
          required: true,
        },
        {
          model: DirecaoVento,
          as: "DirecaoVento",
          required: true,
        },
        {
          model: Precipitacao,
          as: "Precipitacao",
          required: true,
        },
        {
          model: UmidadeSolo,
          as: "UmidadeSolo",
          required: true,
        },
        {
          model: UmidadeRelativa,
          as: "UmidadeRelativa",
          required: true,
        },
      ],
      order: [["id", "asc"]],
    });
    res.json(leitura);
  } else {
    res.json({
      error: "Data inválida",
    });
  }
});

app.get("/leitura/dia", async (req, res) => {
  let data = req.query.data;
  if (moment(data).isValid()) {
    // verifica se a data é válida
    data = moment(data).format("x");
    console.log(data);
    const leitura = await models.Leitura.findAll({
      where: {
        createdAt: {
          [Sequelize.Op.gte]: data, // >= data
          [Sequelize.Op.lt]: Number(data) + 86400000, // < data + 1 dia
        },
      },
      include: [
        {
          model: Temperatura,
          as: "Temperatura",
          required: true,
        },
        {
          model: Pressao,
          as: "Pressao",
          required: true,
        },
        {
          model: Altitude,
          as: "Altitude",
          required: true,
        },
        {
          model: VelocidadeVento,
          as: "VelocidadeVento",
          required: true,
        },
        {
          model: DirecaoVento,
          as: "DirecaoVento",
          required: true,
        },
        {
          model: Precipitacao,
          as: "Precipitacao",
          required: true,
        },
        {
          model: UmidadeSolo,
          as: "UmidadeSolo",
          required: true,
        },
        {
          model: UmidadeRelativa,
          as: "UmidadeRelativa",
          required: true,
        },
      ],
      order: [["id", "asc"]],
    });
    res.json(leitura);
  } else {
    res.json({
      error: "Data inválida",
    });
  }
});

/* SE HOUVER REDUNDANCIA DE SENSORES, 
DEVE-SE RETIRAR O ARRAY.OF() */

app.post("/leitura", async (req, res) => {
  const leitura = await models.Leitura.create({});

  req.body.temperatura.forEach(async (temp) => {
    const aux = temp.split("$");
    await models.Temperatura.create({
      sensor: aux[0],
      valor: parseInt(aux[1]),
      unidade: aux[2],
      ordemGrandeza: parseInt(aux[3]),
      leituraId: leitura.id,
    });
  });
  Array.of(req.body.pressao).forEach(async (press) => {
    const aux = press.split("$");
    await models.Pressao.create({
      sensor: aux[0],
      valor: parseInt(aux[1]),
      unidade: aux[2],
      ordemGrandeza: parseInt(aux[3]),
      leituraId: leitura.id,
    });
  });
  Array.of(req.body.altitude).forEach(async (alt) => {
    const aux = alt.split("$");
    await models.Altitude.create({
      sensor: aux[0],
      valor: parseInt(aux[1]),
      unidade: aux[2],
      ordemGrandeza: parseInt(aux[3]),
      leituraId: leitura.id,
    });
  });
  Array.of(req.body.velocidadevento).forEach(async (vel) => {
    const aux = vel.split("$");
    await models.VelocidadeVento.create({
      sensor: aux[0],
      media: parseInt(aux[1]),
      maximo: parseInt(aux[2]),
      unidade: aux[3],
      ordemGrandeza: parseInt(aux[4]),
      leituraId: leitura.id,
    });
  });
  Array.of(req.body.direcaovento).forEach(async (dir) => {
    const aux = dir.split("$");
    await models.DirecaoVento.create({
      sensor: aux[0],
      valor: parseInt(aux[1]),
      unidade: aux[2],
      ordemGrandeza: parseInt(aux[3]),
      leituraId: leitura.id,
    });
  });
  Array.of(req.body.precipitacao).forEach(async (prec) => {
    const aux = prec.split("$");
    await models.Precipitacao.create({
      sensor: aux[0],
      valor: parseInt(aux[1]),
      unidade: aux[2],
      ordemGrandeza: parseInt(aux[3]),
      leituraId: leitura.id,
    });
  });
  Array.of(req.body.umidadesolo).forEach(async (umisolo) => {
    const aux = umisolo.split("$");
    await models.UmidadeSolo.create({
      sensor: aux[0],
      valor: parseInt(aux[1]),
      unidade: aux[2],
      ordemGrandeza: parseInt(aux[3]),
      leituraId: leitura.id,
    });
  });
  Array.of(req.body.umidaderelativa).forEach(async (umirel) => {
    const aux = umirel.split("$");
    await models.UmidadeRelativa.create({
      sensor: aux[0],
      valor: parseInt(aux[1]),
      unidade: aux[2],
      ordemGrandeza: parseInt(aux[3]),
      leituraId: leitura.id,
    });
  });
  const leituraFinal = await models.Leitura.findOne({
    where: {
      id: leitura.id,
    },
    include: [
      {
        model: Temperatura,
        as: "Temperatura",
        required: true,
      },
      {
        model: Pressao,
        as: "Pressao",
        required: true,
      },
      {
        model: Altitude,
        as: "Altitude",
        required: true,
      },
      {
        model: VelocidadeVento,
        as: "VelocidadeVento",
        required: true,
      },
      {
        model: DirecaoVento,
        as: "DirecaoVento",
        required: true,
      },
      {
        model: Precipitacao,
        as: "Precipitacao",
        required: true,
      },
      {
        model: UmidadeSolo,
        as: "UmidadeSolo",
        required: true,
      },
      {
        model: UmidadeRelativa,
        as: "UmidadeRelativa",
        required: true,
      },
    ],
  });
  res.json(leituraFinal);
});

app.listen(port, () => {
  console.log(`Rodando na porta ${port}`);
});

//localhost:3001/leitura?temperatura=DHT11$260$°C$-1&temperatura=BMP180$220$°C$-1&temperatura=DS18B20$243$°C$-1&pressao=BMP180$180$hPa$-1&altitude=BMP180$5958$m$-1&velocidadevento=anemômetro$62$104$m/s$-1&direcaovento=biruta$180$°$0&precipitacao=pluviômetro$252$mm$-1&umidadesolo=sensorUmiSolo$650$%$-1&umidaderelativa=DHT11$125$%$-1
