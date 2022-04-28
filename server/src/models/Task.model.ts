import "reflect-metadata";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Label, LabelInput } from "./Label.model";
import { Project } from "./Project.model";
import { SubTask, SubTaskInput } from "./SubTask.model";
import { User, UserInput } from "./User.model";

export enum TaskStatus {
  Waiting = 0,
  ToDo = 1,
  Doing = 2,
  Review = 3,
  Done = 4,
}

@ObjectType()
@Entity()
export class Task extends BaseEntity {
  @Field(() => ID, { nullable: true })
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.Waiting })
  status: TaskStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  comment?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  endDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  estimatedDuration: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  duration: string;

  @Field((type) => [SubTask], { nullable: true })
  @OneToMany(() => SubTask, (subtask) => subtask.task)
  checkList: SubTask[];

  @Field((type) => [Label], { nullable: true })
  @ManyToMany((type) => Label, (label) => label.tasks)
  labels: Label[];

  @Field(() => Project, { nullable: true })
  @ManyToOne(() => Project, (project) => project.tasks)
  project: Project;

  @Field(() => [User], { nullable: true })
  @ManyToMany((type) => User, (user) => user.tasks)
  @JoinTable()
  users: User[];

  constructor(project: Project) {
    super();
    this.project = project;
  }
}

@InputType()
export class TaskInput {
  @Field((type) => ID, { nullable: true })
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  estimatedDuration: Date;

  @Field(() => [LabelInput], { nullable: true })
  labels: LabelInput[];

  @Field(() => [SubTaskInput], { nullable: true })
  checkList: SubTask[];

  @Field(() => [UserInput], { nullable: true })
  users: User[];
}
