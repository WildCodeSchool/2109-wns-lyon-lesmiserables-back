import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Project, ProjectInput } from "../models/Project.model";
import { Task, TaskInput } from "../models/Task.model";
import { User, UserInput } from "../models/User.model";
import { TaskResolver } from "./TaskResolver";
import { UserResolver } from "./UserResolver";

@Resolver(Project)
export class ProjectResolver {
  private projectRepo = getRepository(Project);
  private taskController = new TaskResolver();
  private userRepo = new UserResolver();

  // Get all projects
  @Query(() => [Project])
  async getProjects(): Promise<Project[]> {
    return await this.projectRepo.find({ relations: ["managers", "dev"] });
  }

  // Get Project By ID
  @Query(() => Project, { nullable: true })
  async getProjectById(@Arg("id", () => ID) id: number): Promise<Project> {
    try {
      // préciser la relation
      const proj = await this.projectRepo.findOne(id, { relations: ["tasks"] });
      if (!proj) return null;
      return proj;
    } catch (err) {
      console.log(err);
    }
  }

  // Add Project
  @Mutation(() => Project)
  async addProject(
    @Arg("data", () => ProjectInput) project: ProjectInput,
    @Arg("idUser", () => ID) user_id: number
  ): Promise<Project> {
    const user = await this.userRepo.getUserById(user_id);

    if (!user) {
      throw new Error("No user found!");
    }

    let newProject = project;
    newProject.managers = [user] as any;
    const projectSaved = await this.projectRepo.create(newProject).save();
    return projectSaved;
  }

  @Mutation(() => Project)
  async addTaskToProject(
    @Arg("id", () => ID) id: number,
    @Arg("data", () => TaskInput) task: Task
  ): Promise<Project> {
    const findProject = await this.getProjectById(id);
    if (findProject) {
      task.project = findProject;
      const newTask = Task.create(task);
      await newTask.save();
    }
    return await this.projectRepo.findOne(id);
  }

  // @Mutation(() => Project)
  // async addUserToProject(
  //   @Arg("idProject", () => ID) project_id: number,
  //   @Arg("idUser", () => ID) user_id: number
  // ): Promise<Project> {
  //   const findProject = await this.projectRepo.findOne(project_id, {
  //     relations: ["users"],
  //   });
  //   const findUser = await this.userRepo.getUserById(user_id);
  //   if (findProject && findUser) {
  //     // const newUser = User.create(user);
  //     // await newUser.save();
  //     // => return [object Promise]
  //     console.log(findProject.users);
  //     findProject.users = [...findProject.users, findUser] as any;
  //     await findProject.save();
  //     //  user.projects = findProject
  //   }
  //   return await this.projectRepo.findOne(project_id, { relations: ["users"] });
  // }

  // add Manager To Project
  @Mutation(() => Project)
  async setManagerToProject(
    @Arg("idProject", () => ID) project_id: number,
    @Arg("idUser", () => ID) user_id: number
  ): Promise<Project> {
    const findProject = await this.projectRepo.findOne(project_id, {
      relations: ["managers", "dev"],
    });
    const findUser = await this.userRepo.getUserById(user_id);

    if (findProject && findUser) {
      if (findProject.dev && findProject.dev.some((x) => x.id == user_id)) {
        findProject.dev = findProject.dev.filter((x) => x.id != user_id);
      }

      if (
        findProject.managers &&
        !findProject.managers.some((x) => x.id == user_id)
      ) {
        findProject.managers = [...findProject.managers, findUser] as any;
      }
      await findProject.save();
    }
    return await this.projectRepo.findOne(project_id, {
      relations: ["managers", "dev"],
    });
  }

  // add dev To Project
  @Mutation(() => Project)
  async setDevToProject(
    @Arg("idProject", () => ID) project_id: number,
    @Arg("idUser", () => ID) user_id: number
  ): Promise<Project> {
    const findProject = await this.projectRepo.findOne(project_id, {
      relations: ["managers", "dev"],
    });
    const findUser = await this.userRepo.getUserById(user_id);

    if (findProject && findUser) {
      if (
        findProject.managers &&
        findProject.managers.some((x) => x.id == user_id)
      ) {
        findProject.managers = findProject.managers.filter(
          (x) => x.id != user_id
        );
      }

      if (findProject.dev && !findProject.dev.some((x) => x.id == user_id)) {
        findProject.dev = [...findProject.dev, findUser] as any;
      }

      await findProject.save();
    }
    return await this.projectRepo.findOne(project_id, {
      relations: ["managers", "dev"],
    });
  }

  // Update
  @Mutation(() => Project)
  async updateProject(
    @Arg("data", () => ProjectInput) project: ProjectInput,
    @Arg("id", () => ID) id: number
  ): Promise<Project> {
    let findProject = await this.getProjectById(id);
    if (findProject) {
      findProject.title = project.title;
      findProject.save();
    }
    return findProject;
  }

  // Delete project
  @Mutation(() => Boolean)
  async deleteProject(@Arg("id", () => ID) id: number): Promise<boolean> {
    let findProject = await this.getProjectById(id);
    if (findProject) {
      await findProject.remove();
      return true;
    }
    return false;
  }
}
