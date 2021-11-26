import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { User, UserInput } from "../models/User.model";

@Resolver(User)
export class UserResolver {
  private userRepo = getRepository(User);

  @Query(() => [User])
  async getUser(): Promise <User[]> {
    return await this.userRepo.find();
  }

 // on peut copier coller directement dans addTaskToProject
  @Mutation(() => User)
  async addUser(
    @Arg("data", () => UserInput) user: User): Promise<User> {
        const newUser = User.create(user);
        await newUser.save();
        return newUser;
    }

      // Get TAsk By ID
  @Query(() => User, {nullable: true})
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
  async updateTask(@Arg("data",()=> UserInput) user: UserInput, 
  @Arg("id", () => ID) id: number): Promise<User> {
    let findUser= await this.getUserById(id);
    if (findUser){
        findUser.username = user.username
        findUser.save()
    } 
    return findUser;
  }

  // Delete Task
  @Mutation(() => Boolean)
  async deleteTask(@Arg("id", () => ID) id: number): Promise<boolean> {
    let findUser= await this.getUserById(id);
    if (findUser){
       await findUser.remove()
      return true
    } 
    return false
  }

}