import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Project, ProjectInput } from "../models/project.model";

@Resolver(Project)
export class ProjectResolver {
  projectRepo = getRepository(Project);

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

  // @Mutation(() => Project)
  // addProject(@Arg("data", () => ProjectInput) project: ProjectInput): Project {
  //   const projectWithId = { ...project, id: this.projects.length };
  //   this.projects.push(projectWithId as Project);
  //   return projectWithId as Project;
  // }
}
