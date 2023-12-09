// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3001;

// MongoDB connection string
const url = 'mongodb+srv://jc952072:QgeODFlQO4Pndbw4@cluster0.3l5isbk.mongodb.net/?retryWrites=true&w=majority';

// Database and collection names
const dbName = 'IOT_Traffic';
const collectionName = 'data';

// Middleware to handle CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Route to fetch route data
app.get('/routes', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const col = db.collection(collectionName);

    const routes = {};
    const routeNames = ['1', '2', '3', '4'];

    for (const routeName of routeNames) {
      const filter = { "Route": routeName };
      routes[routeName] = await col.findOneAndDelete(filter);
    }

    res.json(routes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
