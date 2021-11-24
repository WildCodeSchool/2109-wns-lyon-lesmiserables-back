// import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
// import { Project, ProjectInput } from "../models/project.model";
// import { Task, TaskInput } from "../models/Task.model";
// import { ProjectResolver } from "./ProjectResolver";

// @Resolver(Task)
// export class TaskResolver {
//   private tasks: Task[] = [];

//   projectRepo = new ProjectResolver();

//   @Query(() => [Task])
//   getTasks(): Task[] {
//     return this.tasks;
//   }

//   @Mutation(() => Task)
//   async addTask(
//     @Arg("idProject", () => ID) id: number,
//     @Arg("data", () => TaskInput) task: Task
//   ): Promise<Task> {
//     const project = await this.projectRepo.getProjectById(id);
//     console.log(project);
//     // if (!project) return null;
//     // task.id = project.tasks.length;
//     // console.log(task);
//     // project.tasks.push(task);

//     return task;
//   }
// }
