import "reflect-metadata";
import { IsEmail, Length } from "class-validator";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IsEmailAlreadyExist } from "../utils/IsEmailAlreadyExist";
import { IsUsernameAlreadyExist } from "../utils/IsUsernameAlreadyExist";
import { Project } from "./Project.model";
import { Task } from "./Task.model";

// export enum Role {
//   Developer = 0,
//   Manager = 1,
//   Admin = 2,
//   SuperAdmin = 3,
// }

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("increment")
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

  @Field(() => [Task], { nullable: true })
  @ManyToMany((type) => Task, (task) => task.users)
  @JoinTable()
  tasks: Task[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  active: boolean = false;

  @Field({ nullable: true })
  @Column({ nullable: true })
  secretToken: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  role: number = 0;

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
  email: string;

  @Field({ nullable: true })
  role: number = 0;

  @Field()
  password: string;
}

@InputType()
export class SignUpInput {
  @Field((type) => ID, { nullable: true })
  id: number;

  @Field()
  @Length(1, 255)
  @IsUsernameAlreadyExist({ message: "Username already in use" })
  username: string;

  @Field()
  @IsEmail()
  @IsEmailAlreadyExist({ message: "Email already in use" })
  email: string;

  @Field({ nullable: true })
  role: number = 0;

  @Field()
  password: string;
}
