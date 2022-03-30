import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { ProjectResolver } from "./resolvers/ProjectResolver";
import { createConnection } from "typeorm";
import { TaskResolver } from "./resolvers/TaskResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { customAuthChecker } from "./utils/auth";
const cookie = require("cookie");

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await createConnection();

  // const userRepo = getRepository(User);
  // const user = userRepo.create({
  //   username: "Loic",
  //   email: "test@test.com",
  //   password: "aaaa",
  // });
  // await userRepo.save(user).catch((err) => {
  //   console.log("Error: ", err);
  // });
  // console.log("New User Saved", user);

  // ... Building schema here
  const schema = await buildSchema({
    resolvers: [ProjectResolver, TaskResolver, UserResolver],
    authChecker: customAuthChecker,
  });

  // Create the GraphQL server
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => {
      const authorization = req.headers.authorization;

      let cookies;
      let parsedCookies;

      if (req.headers.cookie) {
        cookies = req.headers.cookie;
        parsedCookies = cookie.parse(cookies);
      }

      let token = null;

      if (authorization) {
        token = authorization?.startsWith("Bearer ")
          ? authorization.replace("Bearer ", "")
          : authorization;
      } else if (parsedCookies && parsedCookies.token) {
        token = parsedCookies.token;
      }

      return {
        token,
        user: null,
        res,
      };
    },
  });

  // Start the server
  const { url } = await server.listen(PORT);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap();
