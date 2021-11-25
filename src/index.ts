import "reflect-metadata";
const sqlite = require("sqlite3").verbose();
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { ProjectResolver } from "./resolvers/ProjectResolver";
import { createConnection } from "typeorm";
import { TaskResolver } from "./resolvers/TaskResolver";

const PORT = process.env.PORT || 4000;

// const db = new sqlite.Database("MyDB.db");

async function bootstrap() {
  await createConnection();

  // ... Building schema here
  const schema = await buildSchema({
    resolvers: [ProjectResolver,TaskResolver],
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
