import { IsEmail, Length } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IsEmailAlreadyExist } from "../utils/IsEmailAlreadyExist";
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

  @Field()
  @Column("varchar", { unique: true })
  email: string;

  @Field()
  @Column()
  password: string;

  @Field(() => [Project], { nullable: true })
  @ManyToMany(() => Project, (project) => project.users)
  @JoinTable()
  projects: Project[];

  constructor(projects: Project[]) {
    super();
    this.projects = projects;
  }
}

@InputType()
export class UserInput {
  @Field((type) => ID, { nullable: true })
  id: number;

  @Field()
  @Length(1, 255)
  username: string;

  @Field()
  @IsEmail()
  @IsEmailAlreadyExist({ message: "email already in use" })
  email: string;

  @Field()
  password: string;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
