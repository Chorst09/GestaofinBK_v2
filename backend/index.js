const express = require('express');

const app = express();
const port = process.env.PORT || 3001; // Use porta 3001 para não colidir com o frontend (geralmente 3000)

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
