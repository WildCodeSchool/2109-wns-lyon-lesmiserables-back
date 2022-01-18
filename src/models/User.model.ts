import { Field, ID, InputType, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "./Project.model";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  username: string;

  @Field(() => [Project], { nullable: true })
  @ManyToMany(() => Project, project => project.users)
  @JoinTable()
  projects: Project[];

  constructor(projects: Project[]) {
    super();
    this.projects = projects;
  }

}
  @InputType()
    export class UserInput {
  @Field((type) => ID, {nullable: true})
  id: number;

  @Field()
  username: string;
}

