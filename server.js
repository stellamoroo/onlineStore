
const { buildSchema } = require('graphql');
const { createHandler } = require('graphql-http/lib/use/express');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
 
// const environment = {
//   mipaqueteAPI: 'https://api-v2.dev.mpr.mipaquete.com',
//   mipaqueteApiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGI0OWI2ZmMxN2NlMDM0Y2ZmZGM3YzEiLCJuYW1lIjoicHJ1ZWJhcyIsInN1cm5hbWUiOiIuIiwiZW1haWwiOiJwcnVlYmFzbWlwYXF1ZXRlb2ZpY2lhbEBnbWFpbC5jb20iLCJjZWxsUGhvbmUiOiIzMTM2MjczMjM5IiwiY3JlYXRlZEF0IjoiMjAyMS0wNS0zMVQwODoxNjo0Ny43ODhaIiwiZGF0ZSI6IjIwMjUtMDUtMTIgMTY6NTk6NDciLCJpYXQiOjE3NDcwODcxODd9.WfbQVUSDceKSrpwtWrQPDHA_9xQR6KesQZ-G4UpOMPk',
//   mipaqueteSessionTracker: 'a0c96ea6-b22d-4fb7-a278-850678d5429c'
// };
const port = process.env.port;

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query { 
    hello: String,
    quote : String,
    quoteParams(origin: String, destiny: String, height: Int, width: Int, length: Int,
    weight: Float, qty: Int, declVal: Int, saleVal: Int ) : String,
    client(data: String): String,
    transfe(dataCli: String, dataTrans: String): String
  } 
`);
 
// The root provides a resolver function for each API endpoint
const root = {
  hello() {
    return 'Hello world!';
  },
  quote() {
    let q = 'q';
    return new Promise((resolve) => {
      fetch( `${process.env.mipaqueteAPI}/quoteShipping`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'session-tracker': `${process.env.mipaqueteSessionTracker}` ,
          'apikey': `${process.env.mipaqueteApiKey}`
        },
        body: JSON.stringify({
          "originLocationCode": "05001000",
          "destinyLocationCode": "76895002", // código DANE de ciudad o municipio destino
          "height": 14, // alto del paquete en cm(número entero)
          "width": 25, // ancho del paquete  en cm (número entero)
          "length": 35, // largo del paquete en cm(número entero)
          "weight": 3, // peso del paquete en kg (número entero)
          "quantity": 1, // cantidad de paquetes con la misma medida y peso
          "declaredValue": 200000, // valor declarado o valor asegurar de la unidad (cuánto cuesta producir el producto)
          "saleValue": 200000 // aplica para pago contraentrega - el valor de la venta del producto o paquete.
        })
      }).then((response) => {
        response.text().then((rr) => {
          //console.log("RESPONSE ", response);
          console.log("rr ", rr);
          q = rr;
          resolve(q );
        });
      });
    });
  },
  quoteParams({origin, destiny, height, width, length,
    weight, qty, declVal, saleVal}) {
      console.log(`apiKey: ${process.env.mipaqueteApiKey}`);
    return new Promise((resolve, reject) => {
      fetch( `${process.env.mipaqueteAPI}/quoteShipping`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'session-tracker': `${process.env.mipaqueteSessionTracker}` ,
          'apikey': `${process.env.mipaqueteApiKey}`
        },
        body: JSON.stringify({
          "originLocationCode": origin,
          "destinyLocationCode": destiny, // código DANE de ciudad o municipio destino
          "height": height, // alto del paquete en cm(número entero)
          "width": width, // ancho del paquete  en cm (número entero)
          "length": length, // largo del paquete en cm(número entero)
          "weight": weight, // peso del paquete en kg (número entero)
          "quantity": qty, // cantidad de paquetes con la misma medida y peso
          "declaredValue": declVal, // valor declarado o valor asegurar de la unidad (cuánto cuesta producir el producto)
          "saleValue": saleVal // aplica para pago contraentrega - el valor de la venta del producto o paquete.
        })
      }).then((response) => {
        if (!response.ok) {
          reject(`HTTP error! Status: ${response.status}`);
        }
        response.text().then((rr) => {
          //console.log("RESPONSE ", response);
          console.log("quoteParams rr ", rr);
          resolve( rr );
        });
      });
    });

  },
  client(data) {
      return new Promise((resolve, reject) => {
        console.log(data);
        resolve('Info Cliente guardada !' );
        //reject('unknown error');  //it won't get to this line
      });      
  },
  transfe({dataCli, dataTrans}){ 
    return new Promise((resolve,reject) => {
      console.log('transfe :', dataCli, dataTrans);
      resolve('Info Transacción recibida !' );
      /*const client = JSON.parse(dataCli);
      const transaction = JSON.parse( dataTrans );
      const now = new Date();
      console.log('transaction: ', transaction,
      ' client: ', client );

      const fname2 = transaction.data.x_ref_payco 
        ? transaction.data.x_ref_payco : client.name 
      // fname2 = './downloads/ref_payco' + fname2 + '_'  + now.getHours() 
      //   + '_' + now.getMinutes() + '_' + now.getSeconds() +'.dat'
      console.log('fname2: ', fname2);      

      fs.appendFile('./downloads/ref_payco' + fname2 + '_'  + now.getHours() 
        + '_' + now.getMinutes() + '_' + now.getSeconds() +'.dat', 
        JSON.stringify({ data: {client , transaction} }), 
        function (err) {
          if (err) {
            console.error('Caught error:', err);
            reject(err);
          }else{
            resolve('Info Transacción guardada !' );
          }
      }); */ 
    });      
  }
}
 
const app = express();

// Enable CORS for your frontend
app.use(cors({
  origin: '*', // frontend URL * ,http://localhost:4200,  '*'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
  credentials: true // allow cookies and auth headers
})); 


// Create and use the GraphQL handler.
app.all(
  '/graphql',
  createHandler({
    schema: schema,
    rootValue: root,
  }),
);
/* 
//doesn't work, the body content isn't received, it must be due to conflict graphql 
// and post /client
app.post('/client', (req, res) => {
    console.log("REQUEST client ", req.body ); //req from postman data
    const now = new Date();
    const fname = req.body.transa.data.x_ref_payco
    ?  req.body.transa.data.x_ref_payco : req.body.client.name
    fs.appendFile('./downloads/ref_payco' +
      fname + '_'  + now.getHours() + '_' + now.getMinutes() + '_' + now.getSeconds()
       +'.dat', JSON.stringify({ data: req.body}),
        function (err) {
          if (err) throw err;
          // console.log(req.body.toString())
      }); 

    res.send('Hello Client!');
    //console.log("RESPONSE ", res)
  });
 */
 


// Start the server at port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}/graphql`)
})
 
