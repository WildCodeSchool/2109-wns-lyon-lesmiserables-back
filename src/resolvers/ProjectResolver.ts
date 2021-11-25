import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Project, ProjectInput } from "../models/Project.model";

@Resolver(Project)
export class ProjectResolver {
  private projectRepo = getRepository(Project);

  @Query(() => [Project])
  async getProjects(): Promise<Project[]> {
    return await this.projectRepo.find();
  }

  // @Query(() => Project)
  // async getProjectById(@Arg("id", () => ID) id: number): Promise<Project> {
  //   try {
  //     const proj = await this.projects.find((x) => x.id === id);
  //     if (!proj) return null;
  //     return proj;
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  @Mutation(() => Project)
  async addProject(@Arg("data") project: ProjectInput): Promise<Project> {
    console.log("ICIIIIII", project);
    const projectTmp = Project.create(project);
    await projectTmp.save();
    return projectTmp;
  }
}
