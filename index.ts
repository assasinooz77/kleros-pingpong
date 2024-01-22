import app from "./src/app";

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server http://localhost:${port}`);
});
