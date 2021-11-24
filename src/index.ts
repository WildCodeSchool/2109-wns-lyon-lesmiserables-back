import "reflect-metadata";
const sqlite = require("sqlite3").verbose();
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { ProjectResolver } from "./resolvers/ProjectResolver";
import { TaskResolver } from "./resolvers/TaskResolver";

const PORT = process.env.PORT || 4000;

const db = new sqlite.Database("MyDB.db");

db.serialize(function () {
  db.run("CREATE TABLE IF NOT EXISTS projects (id TEXT, title TEXT)");
  db.all("SELECT ID, TITLE FROM projects", function (err, row) {
    if (err) {
      console.log(err);
    } else {
      if (row.length === 0) {
        var stmt = db.prepare("INSERT INTO projects VALUES (?, ?)");
        var obj = [{ id: "1", title: "test" }];
        for (var i in obj) {
          stmt.run(obj[i].id, obj[i].title);
        }
        stmt.finalize();
      } else {
        console.log("Database already exists");
      }
    }
  });
});

async function bootstrap() {
  // ... Building schema here
  const schema = await buildSchema({
    resolvers: [ProjectResolver, TaskResolver],
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
