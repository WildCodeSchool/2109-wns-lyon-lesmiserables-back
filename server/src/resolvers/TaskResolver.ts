import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Task, TaskInput } from "../models/Task.model";

@Resolver(Task)
export class TaskResolver {
  private taskRepo = getRepository(Task);

  @Query(() => [Task])
  async getTasks(): Promise<Task[]> {
    return await this.taskRepo.find();
  }

  // on peut copier coller directement dans addTaskToProject
  @Mutation(() => Task)
  async addTask(@Arg("data", () => TaskInput) task: Task): Promise<Task> {
    const newTask = await Task.create(task).save();
    console.log(newTask);
    return newTask;
  }

  // Get TAsk By ID
  @Query(() => Task, { nullable: true })
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
  async updateTask(
    @Arg("data", () => TaskInput) task: TaskInput,
    @Arg("id", () => ID) id: number
  ): Promise<Task> {
    let findTask = await this.getTaskById(id);
    if (findTask) {
      findTask.title = task.title;
      findTask.save();
    }
    return findTask;
  }

  // Delete Task
  @Mutation(() => Boolean)
  async deleteTask(@Arg("id", () => ID) id: number): Promise<boolean> {
    let findTask = await this.getTaskById(id);
    if (findTask) {
      await findTask.remove();
      return true;
    }
    return false;
  }
}
