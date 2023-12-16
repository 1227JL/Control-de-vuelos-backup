import Vuelo from "./models/Vuelo.js";

const aerolineas = [
  {
    idVuelo: "ABC123",
    infoVuelo: {
      aerolinea: "6565ee05a0e0a4dbeeed7ba7",
      origen: "6565f1419a44f07d3ea5f7a1",
      destino: "6565f1399a44f07d3ea5f771",
      fechaSalida: "2023-12-01T08:00:00.000Z",
      horaSalida: "2023-12-01T08:00:00.000Z",
      fechaLlegada: "2023-12-01T08:45:00.000Z",
      horaLlegada: "2023-12-01T08:45:00.000Z",
    },
  },
  {
    idVuelo: "DEF456",
    infoVuelo: {
      aerolinea: "6565ee0ba0e0a4dbeeed7bb3",
      origen: "6565f1399a44f07d3ea5f771",
      destino: "6565f13f9a44f07d3ea5f77d",
      fechaSalida: "2023-12-02T10:30:00.000Z",
      horaSalida: "2023-12-02T10:30:00.000Z",
      fechaLlegada: "2023-12-02T11:45:00.000Z",
      horaLlegada: "2023-12-02T11:45:00.000Z",
    },
  },
  {
    idVuelo: "XYZ789",
    infoVuelo: {
      aerolinea: "6565ee0ba0e0a4dbeeed7bb5",
      origen: "6565f13e9a44f07d3ea5f779",
      destino: "6565f13e9a44f07d3ea5f775",
      fechaSalida: "2023-12-05T12:00:00.000Z",
      horaSalida: "2023-12-05T12:00:00.000Z",
      fechaLlegada: "2023-12-05T14:30:00.000Z",
      horaLlegada: "2023-12-05T14:30:00.000Z",
    },
  }  
];

export default async function insertarVuelosEnDB() {
  try {
    for (const aerolinea of aerolineas) {
      await Vuelo.create(aerolinea);
      console.log(`Aerolinea insertada: ${aerolinea._id}`);
    }

    console.log("Todos los vuelos fueron insertados correctamente.");
  } catch (error) {
    console.error("Error al insertar vuelos:", error);
  }
}
