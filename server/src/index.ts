import "reflect-metadata";
const mysql = require("mysql");
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { ProjectResolver } from "./resolvers/ProjectResolver";
import { createConnection } from "typeorm";
import { TaskResolver } from "./resolvers/TaskResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { getRepository } from "typeorm";
import { User } from "./models/User.model";

const PORT = process.env.PORT || 4000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "mastermine",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connecté à la base de données MySQL!");
  // db.query("CREATE DATABASE mastermine", function (err, result) {
  //   if (err) throw err;
  //   console.log("Base de données créée !");
  // });
});

async function bootstrap() {
  await createConnection();

  // const userRepo = getRepository(User);
  // const user = userRepo.create({
  //   username: "Loic Dutrou",
  // });
  // await userRepo.save(user).catch((err) => {
  //   console.log("Error: ", err);
  // });
  // console.log("New User Saved", user);

  // ... Building schema here
  const schema = await buildSchema({
    resolvers: [ProjectResolver, TaskResolver, UserResolver],
  });

  // Create the GraphQL server
  const server = new ApolloServer({
    schema,
  });

  // Start the server
  const { url } = await server.listen(PORT);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap();
