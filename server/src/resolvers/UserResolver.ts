import {
  Arg,
  Ctx,
  Field,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getRepository } from "typeorm";
import { User, UserInput } from "../models/User.model";
import * as argon2 from "argon2";
import { isAuth } from "../utils/isAuth";
import { MyContext } from "../context/MyContext";
import { sign } from "jsonwebtoken";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver(User)
export class UserResolver {
  private userRepo = getRepository(User);

  @Query(() => String)
  @UseMiddleware(isAuth)
  async Me(@Ctx() { payload }: MyContext) {
    return `Your user id : ${payload!.userId}`;
  }

  @Query(() => [User])
  async getUser(): Promise<User[]> {
    return await this.userRepo.find();
  }

  @Mutation(() => User)
  async addUser(@Arg("data", () => UserInput) user: User): Promise<User> {
    const newUser = user;
    newUser.password = await argon2.hash(user.password);
    const userToSave = await this.userRepo.create(newUser).save();

    return userToSave;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<LoginResponse> {
    try {
      const user = await this.userRepo.findOne({ where: { email: email } });
      if (!user) {
        throw new Error("No user found!");
      }

      // ok okokok

      if (await argon2.verify(user.password, password)) {
        return {
          accessToken: sign({ userId: user.id }, "MySecretKey", {
            expiresIn: "15m",
          }),
        };
      } else {
        throw new Error("Email or password incorrect !");
      }
    } catch (err) {
      console.log(err);
    }
  }

  // Get TAsk By ID
  @Query(() => User, { nullable: true })
  async getUserById(@Arg("id", () => ID) id: number): Promise<User> {
    try {
      const user = await this.userRepo.findOne(id);
      if (!user) return null;
      return user;
    } catch (err) {
      console.log(err);
    }
  }

  // Update
  @Mutation(() => User)
  async updateTask(
    @Arg("data", () => UserInput) user: UserInput,
    @Arg("id", () => ID) id: number
  ): Promise<User> {
    let findUser = await this.getUserById(id);
    if (findUser) {
      findUser.username = user.username;
      findUser.save();
    }
    return findUser;
  }

  // Delete Task
  @Mutation(() => Boolean)
  async deleteTask(@Arg("id", () => ID) id: number): Promise<boolean> {
    let findUser = await this.getUserById(id);
    if (findUser) {
      await findUser.remove();
      return true;
    }
    return false;
  }
}
