import "reflect-metadata";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Task, TaskInput } from "./Task.model";

@ObjectType()
@Entity()
export class Label extends BaseEntity {
  @Field((type) => ID)
  @PrimaryGeneratedColumn("increment")
  id: string;

  @Field()
  @Column()
  title: string;

  @ManyToMany((type) => Task, (task) => task.labels)
  @Field((type) => [Task], { nullable: true })
  tasks: Task[];

  constructor(tasks: Task[]) {
    super();
    this.tasks = tasks;
  }
}

@InputType()
export class LabelInput {
  @Field((type) => ID, { nullable: true })
  id: number;

  @Field()
  title: string;

  @Field((type) => [TaskInput], { nullable: true })
  tasks: TaskInput[];
}
