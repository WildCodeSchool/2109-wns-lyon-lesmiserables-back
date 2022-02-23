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
import { DriverOptionNotSetError, getRepository } from "typeorm";
import { User, UserInput } from "../models/User.model";
import * as argon2 from "argon2";
import { isAuth } from "../utils/isAuth";
import { MyContext } from "../context/MyContext";
import { sign } from "jsonwebtoken";
const nodemailer = require("nodemailer");
import * as config from "../utils/config.json";
import * as randomstring from "randomstring";

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
  async signin(@Arg("data", () => UserInput) user: User): Promise<User> {
    const userTmp = await this.userRepo.findOne({
      where: { email: user.email },
    });

    if (userTmp) {
      throw new Error("Account already exists !");
    }

    let newUser = user;
    newUser.password = await argon2.hash(user.password);
    newUser.secretToken = randomstring.generate();
    newUser.active = false;
    await this.userRepo.create(newUser).save();

    let transporter = nodemailer.createTransport(config.smtpOptions);

    let mailOptions = {
      from: "contact.mastermine@gmail.com",
      to: "loicpimet@gmail.com", //userToSave.email,
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: `<div><a>pppppp</a></div>`, // html body
    };

    await transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return newUser;
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

      const isValid = await argon2.verify(user.password, password);

      if (!isValid) {
        throw new Error("Email or password incorrect !");
      }

      if (!user.active) {
        throw new Error("Check your email.");
      }

      if (isValid) {
        return {
          accessToken: sign({ userId: user.id }, "MySecretKey", {
            expiresIn: "15m",
          }),
        };
      }
    } catch (err) {
      console.log(err);
    }
  }

  //TODO check if correct
  // @Mutation(() => User)
  // async verifyAccount(@Arg("data") user: User): Promise<LoginResponse> {
  //   const { secretToken } = user;
  //   const newUser = await this.userRepo.findOne({
  //     where: { secretToken: secretToken },
  //   });

  //   if (!newUser) {
  //     throw new Error("No user found");
  //   }

  //   newUser.active = true;
  //   newUser.secretToken = "";
  //   await newUser.save();
  //   return;
  // }

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
