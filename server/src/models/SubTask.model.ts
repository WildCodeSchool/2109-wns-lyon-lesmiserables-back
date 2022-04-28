import "reflect-metadata";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Task, TaskInput } from "./Task.model";

@ObjectType()
@Entity()
export class SubTask extends BaseEntity {
  @Field((type) => ID)
  @PrimaryGeneratedColumn("increment")
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  status: boolean;

  @Field(() => Task, { nullable: true })
  @ManyToOne(() => Task, (task) => task.checkList)
  task: Task;

  constructor(task: Task) {
    super();
    this.task = task;
  }
}

@InputType()
export class SubTaskInput {
  @Field((type) => ID, { nullable: true })
  id: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  status: boolean;
}
