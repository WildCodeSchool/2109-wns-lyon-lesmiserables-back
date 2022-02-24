import {
  Arg,
  Authorized,
  Ctx,
  Field,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { getRepository } from "typeorm";
import { SignUpInput, User, UserInput } from "../models/User.model";
import * as argon2 from "argon2";
import { sign } from "jsonwebtoken";
const mailer = require("../utils/mailer");

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver(User)
export class UserResolver {
  private userRepo = getRepository(User);

  @Authorized()
  @Query(() => User)
  async getProfile(@Ctx() context: { user: User }): Promise<User | null> {
    const user = context.user;
    return await this.userRepo.findOne(user.id);
  }

  @Query(() => [User])
  async getUser(): Promise<User[]> {
    return await this.userRepo.find();
  }

  @Mutation(() => User)
  async signUp(
    @Arg("data", () => SignUpInput) user: User
  ): Promise<LoginResponse> {
    const userTmp = await this.userRepo.findOne({
      where: { email: user.email },
    });

    if (userTmp) {
      throw new Error("Account already exists !");
    }

    let newUser = user;
    newUser.password = await argon2.hash(user.password);
    newUser.active = false;
    newUser.secretToken = "";

    let userSaved = await this.userRepo.create(newUser).save();
    userSaved.secretToken = sign(
      { iss: "mastermine", sub: userSaved.id },
      "MySecretKey",
      {
        expiresIn: "15m",
      }
    );
    await userSaved.save();

    const html = `Thank you for registering!
      <br/><br/>To validate your email, click on the link below (only available for 15min) :
      <br/><a href="www.google.com?token=${userSaved.secretToken} target="_blank">Here</a>
      <br/><br/>Have a nice day!
    `;

    await mailer.sendEmail(
      "contact.mastermine@gmail.com",
      userSaved.email,
      `Hello ${user.username} ✔`,
      html
    );

    console.log("Please check your email!");
    return { accessToken: userSaved.secretToken };
  }

  @Mutation(() => LoginResponse)
  async signIn(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<LoginResponse> {
    try {
      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        throw new Error("No user found!");
      }

      const isValid = await argon2.verify(user.password, password);

      if (!isValid) {
        throw new Error("Email or password incorrect !");
      }

      if (isValid) {
        return {
          accessToken: sign({ sub: user.id }, "MySecretKey", {
            expiresIn: "1h",
          }),
        };
      }
    } catch (err) {
      console.log(err);
    }
  }

  @Mutation(() => User)
  async verifyAccount(@Arg("token") token: string): Promise<User> {
    const newUser = await this.userRepo.findOne({
      where: { secretToken: token.trim() },
    });

    if (!newUser) {
      throw new Error("No user found");
    }

    newUser.active = true;
    newUser.secretToken = "";
    await newUser.save();
    return newUser;
  }

  @Mutation(() => User)
  async forgotPassword(@Arg("email") email: string): Promise<LoginResponse> {
    let user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) throw new Error("No user found!");

    user.secretToken = sign(
      { iss: "mastermine", sub: user.id },
      "MySecretKey",
      {
        expiresIn: "15m",
      }
    );
    await user.save();

    const html = `We are here to help you,
      <br/><br/>To reset your password, click on the link below (only available for 15min) :
      <br/><a href="www.google.com?token=${user.secretToken} target="_blank">Here</a>
      <br/><br/>Have a nice day!
    `;

    await mailer.sendEmail(
      "contact.mastermine@gmail.com",
      user.email,
      `Hello ${user.username} ✔`,
      html
    );

    console.log("Please check your email!");
    return { accessToken: user.secretToken };
  }

  @Mutation(() => User)
  async resetPassword(
    @Arg("token") token: string,
    @Arg("password") password: string
  ): Promise<User> {
    let userTmp = await this.userRepo.findOne({
      where: { secretToken: token },
    });

    if (!userTmp) throw new Error("Time limit has been exceeded");

    userTmp.password = await argon2.hash(password);
    userTmp.secretToken = "";

    const userSaved = await userTmp.save();
    return userSaved;
  }

  // Get User By ID
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
  // TODO
  @Mutation(() => User)
  async updateUser(
    @Arg("data", () => UserInput) user: UserInput
  ): Promise<User> {
    let findUser = await this.getUserById(user.id);
    if (findUser) {
      findUser.username = user.username;
      user.password && (findUser.password = await argon2.hash(user.password));
      user.role && (findUser.role = user.role);
      findUser.email = user.email;
      findUser.save();
    }
    return findUser;
  }

  // Delete User
  @Mutation(() => Boolean)
  async deleteUser(@Arg("id", () => ID) id: number): Promise<boolean> {
    let findUser = await this.getUserById(id);
    if (findUser) {
      await findUser.remove();
      return true;
    }
    return false;
  }
}
