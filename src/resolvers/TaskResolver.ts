import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Project, ProjectInput } from "../models/project.model";
import { Task, TaskInput } from "../models/Task.model";
import { ProjectResolver } from "./ProjectResolver";

@Resolver(Task)
export class TaskResolver {
  private projectController = new ProjectResolver();
  private taskRepo = getRepository(Task);

  @Query(() => [Task])
  async getTasks(): Promise <Task[]> {
    return await this.taskRepo.find();
  }


  @Mutation(() => Task)
  async addTask(
    @Arg("data", () => TaskInput) task: Task): Promise<Task> {
        const newTask = Task.create(task);
        await newTask.save();
        return newTask;
    }

     // Get TAsk By ID
  @Query(() => Task, {nullable: true})
  async getTaskById(@Arg("id", () => ID) id: number): Promise<Task> {
    try {
      const task = await this.taskRepo.findOne(id);
      if (!task) return null;
      return task;
    } catch (err) {
      console.log(err);
    }
  }

     // Update
  @Mutation(() => Task)
  async updateTask(@Arg("data",()=> TaskInput) task: TaskInput, 
  @Arg("id", () => ID) id: number): Promise<Task> {
    let findTask= await this.getTaskById(id);
    if (findTask){
        findTask.title = task.title
        findTask.save()
    } 
    return findTask;
  }

  // Delete Task
  @Mutation(() => Boolean)
  async deleteTask(@Arg("id", () => ID) id: number): Promise<boolean> {
    let findTask= await this.getTaskById(id);
    if (findTask){
       await findTask.remove()
      return true
    } 
    return false
  }



 
}
