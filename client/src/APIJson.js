export const fields = [
    {
      name: "Arecanut 1",
      id: "1232164",
      dimensions: "120 X 120",
      status: "Active",
      coordinates: [12.992688, 77.4982241], // [latitude, longitude]
    },
    {
      name: "Arecanut 2",
      id: "1232165",
      dimensions: "120 X 120",
      status: "Inactive",
      coordinates: [14.215888, 76.398907], // Example coordinates
    },
    {
      name: "Arecanut 3",
      id: "1232166",
      dimensions: "120 X 120",
      status: "Inactive",
      coordinates: [16.22545, 74.8419], // Example coordinates
    },
    {
      name: "Arecanut 4",
      id: "1232167",
      dimensions: "120 X 120",
      status: "Active",
      coordinates: [16.2255, 74.842], // Example coordinates
    },
    {
      name: "Arecanut 5",
      id: "1232168",
      dimensions: "120 X 120",
      status: "Active",
      coordinates: [16.22555, 74.8421], // Example coordinates
    },
  ];

  export const gauges = [
    { value: 97, name: "Nitrogen" },
    { value: 57, name: "Phosphorus" },
    { value: 37, name: "Potassium" },
    { value: 75, name: "Temperature" },
    { value: 45, name: "Humidity" },
    { value: 60, name: "A.Moisture" },
  ];
  export  const notifications = [
    { message: "New crop update available", time: "10:30 AM" },
    { message: "Water levels low in field", time: "09:15 AM" },
    { message: "Fertilizer reminder", time: "Yesterday" },
    { message: "Weather alert: Rain tomorrow", time: "2 days ago" },
    { message: "Soil pH adjustment needed", time: "3 days ago" },
  ];
  export const jsonData = {
    mapData: [
      {
        type: "farmland",
        coordinates: [
          [16.2246, 74.8412],
          [16.2246, 74.8428],
          [16.2252, 74.8428],
          [16.2252, 74.8412],
        ],
      },
      { type: "valve", lat: 16.2249, lon: 74.8423, label: "Valve 1" },
      { type: "valve", lat: 16.225, lon: 74.8423, label: "Valve 2" },
      {
        type: "moisture",
        lat: 16.2247,
        lon: 74.8414,
        label: "Sensor 1",
        moistureValue: 30,
      },
      {
        type: "moisture",
        lat: 16.2247,
        lon: 74.8416,
        label: "Sensor 2",
        moistureValue: 40,
      },
      {
        type: "moisture",
        lat: 16.2247,
        lon: 74.8418,
        label: "Sensor 3",
        moistureValue: 50,
      },
      {
        type: "moisture",
        lat: 16.2247,
        lon: 74.842,
        label: "Sensor 4",
        moistureValue: 60,
      },
      {
        type: "moisture",
        lat: 16.2251,
        lon: 74.8414,
        label: "Sensor 5",
        moistureValue: 70,
      },
      {
        type: "moisture",
        lat: 16.2251,
        lon: 74.8416,
        label: "Sensor 6",
        moistureValue: 80,
      },
      {
        type: "moisture",
        lat: 16.2251,
        lon: 74.8418,
        label: "Sensor 7",
        moistureValue: 90,
      },
      {
        type: "moisture",
        lat: 16.2251,
        lon: 74.842,
        label: "Sensor 8",
        moistureValue: 80,
      },
      {
        type: "moisture",
        lat: 16.2249,
        lon: 74.8416,
        label: "Sensor 9",
        moistureValue: 70,
      },
      {
        type: "moisture",
        lat: 16.2249,
        lon: 74.8418,
        label: "Sensor 10",
        moistureValue: 100,
      },
      {
        type: "npk",
        lat: 16.225,
        lon: 74.8425,
        label: "NPK Sensor",
        npkValue: 20,
      },
    ],
  };
  export const sectionsData = [
    {
      section_device_id: 1,
      valve_mode: "auto",
      valve_status: "on",
      moisture_level: 30,
    },
    {
      section_device_id: 2,
      valve_mode: "manual",
      valve_status: "off",
      moisture_level: 45,
    },
    {
      section_device_id: 3,
      valve_mode: "auto",
      valve_status: "on",
      moisture_level: 25,
    },
  ];

  export const username = "Somanna";
  export const userId = "U5435324";
  export const field = 5;

  export const logs = [
    {
      title: "New crop update available",
      time: "00:00:00"
    },
    {
      title: "New crop update available",
      time: "00:00:00"
    },
    {
      title: "New crop update available",
      time: "00:00:00"
    },
    {
      title: "New crop update available",
      time: "00:00:00"
    }
    , {
      title: "New crop update available",
      time: "00:00:00"
    }
  ]

  export const farmdata=[
    {
      farmname:'Arecanut 1'
    }
  ]