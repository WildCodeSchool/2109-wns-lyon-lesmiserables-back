import {
  Arg,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { getRepository } from "typeorm";
import { Project, ProjectInput } from "../models/Project.model";
import { Task, TaskInput, TaskStatus } from "../models/Task.model";
import { User, UserInput } from "../models/User.model";
import { TaskResolver } from "./TaskResolver";
import { UserResolver } from "./UserResolver";

@Resolver(Project)
export class ProjectResolver {
  private projectRepo = getRepository(Project);
  private userRepo = new UserResolver();
  private taskResolver = new TaskResolver();

  // Get all projects
  @Authorized()
  @Query(() => [Project])
  async getProjects(): Promise<Project[]> {
    return await this.projectRepo.find({ relations: ["managers", "dev"] });
  }

  @Query(() => Project, { nullable: true })
  async getDevInProject(@Arg("id", () => ID) id: number): Promise<any> {
    try {
      // préciser la relation
      return await this.projectRepo.findOne(id, { relations: ["dev"] });
    } catch (err) {
      console.log(err);
    }
  }

  @Query(() => Project, { nullable: true })
  async getManagersInProject(@Arg("id", () => ID) id: number): Promise<any> {
    try {
      // préciser la relation
      return await this.projectRepo.findOne(id, { relations: ["managers"] });
    } catch (err) {
      console.log(err);
    }
  }

  // Get Project By ID
  @Authorized()
  @Query(() => Project, { nullable: true })
  async getProjectById(@Arg("id", () => ID) id: number): Promise<Project> {
    try {
      const proj = await this.projectRepo.findOne(id, { relations: ["tasks"] });
      if (!proj) return null;
      return proj;
    } catch (err) {
      console.log(err);
    }
  }

  // Add Project
  @Authorized()
  @Mutation(() => Project)
  async addProject(
    @Arg("data", () => ProjectInput) project: Project,
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

  // ajouter une tâche à un projet
  @Authorized()
  @Mutation(() => Project)
  async addTaskToProject(
    @Ctx() ctx,
    @Arg("idProject", () => ID) project_id: number,
    @Arg("data", () => TaskInput) task: Task
  ): Promise<Project> {
    try {
      const project = await this.projectRepo.findOne(project_id, {
        relations: ["dev", "managers"],
      });

      if (project) {
        if (
          project.managers.some((x) => x.id == ctx.user.id) ||
          project.dev.some((x) => x.id == ctx.user.id)
        ) {
          task.project = project;
          if (!task.status) task.status = TaskStatus.Waiting;
          await Task.create(task).save();
        }
      }

      return await this.projectRepo.findOne(project_id, {
        relations: ["tasks", "dev", "managers"],
      });
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  // add Manager To Project
  @Authorized()
  @Mutation(() => Project)
  async addDevToProject(
    @Ctx() ctx,
    @Arg("idProject", () => ID) project_id: number,
    @Arg("idDev", () => ID) dev_id: number
  ): Promise<Project> {
    try {
      const project = await this.projectRepo.findOne(project_id, {
        relations: ["dev", "managers"],
      });

      if (project.managers.some((x) => x.id == ctx.user.id)) {
        const findUser = await this.userRepo.getUserById(dev_id);

        if (project.dev && project.dev.some((x) => x.id == dev_id)) {
          project.dev = [...project.dev, findUser] as any;
          await project.save();
        }

        return await this.projectRepo.findOne(project_id, {
          relations: ["dev", "managers"],
        });
      }
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  @Authorized()
  @Mutation(() => Project)
  async setManagerToProject(
    @Ctx() ctx,
    @Arg("idProject", () => ID) project_id: number,
    @Arg("idUser", () => ID) user_id: number
  ): Promise<Project> {
    try {
      const findProject = await this.projectRepo.findOne(project_id, {
        relations: ["managers", "dev"],
      });
      const findUser = await this.userRepo.getUserById(user_id);

      if (
        findProject &&
        findUser &&
        findProject.managers.some((x) => x.id == ctx.user.id)
      ) {
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
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  // add dev To Project
  @Authorized()
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
  @Authorized()
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
  @Authorized()
  @Mutation(() => Boolean)
  async deleteProject(
    @Arg("projectId", () => ID) projectId: number,
    @Arg("userId", () => ID) userId: number
  ): Promise<boolean> {
    try {
      const project = await this.projectRepo.findOne(projectId, {
        relations: ["managers"],
      });

      if (project.managers.some((x) => x.id == userId)) {
        await project.remove();
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
