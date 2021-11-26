import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Project, ProjectInput } from "../models/Project.model";
import { Task, TaskInput } from "../models/Task.model";
import { User, UserInput } from "../models/User.model";
import { TaskResolver } from "./TaskResolver";

@Resolver(Project)
export class ProjectResolver {
  private projectRepo = getRepository(Project);
  private taskController = new TaskResolver() 
  // Get all projects
  @Query(() => [Project])
  async getProjects(): Promise<Project[]> {
    return await this.projectRepo.find();
  }

  // Get Project By ID
  @Query(() => Project, {nullable: true})
  async getProjectById(@Arg("id", () => ID) id: number): Promise<Project> {
    try {
      // préciser la relation 
      const proj = await this.projectRepo.findOne(id, {relations: ["tasks"]});
      if (!proj) return null;
      return proj;
    } catch (err) {
      console.log(err);
    }
  }

  // Add Project
  @Mutation(() => Project)
  async addProject(@Arg("data",()=> ProjectInput) project: ProjectInput): Promise<Project> {
    const projectTmp = Project.create(project);
    await projectTmp.save();
    return projectTmp;
  }

  @Mutation(() => Project)
  async addTaskToProject(
    @Arg("id", () => ID) id: number,
    @Arg("data", () => TaskInput) task: Task
  ): Promise<Project> {
    console.log('helo')
    const findProject= await this.getProjectById(id);
    if (findProject){
      task.project = findProject
      const newTask = Task.create(task);
      await newTask.save();
    }
    return await this.projectRepo.findOne(id);
  }

  @Mutation(() => Project)
  async addUserToProject(
    @Arg("id", () => ID) id: number,
    @Arg("data", () => UserInput) user: User
  ): Promise<Project> {
    console.log('helo')
    const findProject= await this.getProjectById(id);
    if (findProject){
      const newUser = User.create(user);
      await newUser.save();
     
    }
    return await this.projectRepo.findOne(id);
  }

  // Update
  @Mutation(() => Project)
  async updateProject(@Arg("data",()=> ProjectInput) project: ProjectInput, 
  @Arg("id", () => ID) id: number): Promise<Project> {
    let findProject= await this.getProjectById(id);
    if (findProject){
      findProject.title = project.title
      findProject.save()
    } 
    return findProject;
  }

  // Delete project
  @Mutation(() => Boolean)
  async deleteProject(@Arg("id", () => ID) id: number): Promise<boolean> {
    let findProject= await this.getProjectById(id);
    if (findProject){
      await findProject.remove()
      return true
    } 
    return false
  }
}
