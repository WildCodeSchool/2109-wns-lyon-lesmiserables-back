import "reflect-metadata";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Task, TaskInput } from "./Task.model";

@ObjectType()
@Entity()
export class Project extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Field()
  @Column()
  title: string;

  //   @Field({ nullable: true })
  //   description?: string;

  //   @Field()
  //   status: boolean;

  //   @Field()
  //   startDate: Date;

  //   @Field({ nullable: true })
  //   endDate: Date;

  //   @Field({ nullable: true })
  //   estimatedEndDate: Date;

  //   @Field({ nullable: true })
  //   photo: string;

  // @Field(() => [Task], { nullable: true })
  // @Column()
  // tasks: Task[];

  @Field(() => [Task], { nullable: true })
  @OneToMany(() => Task, (task) => task.project, {lazy:true}) // eager => "le plus tot possible" lazy => le plus opti => ca devient des promesses
  tasks: Promise<Task[]>;

  constructor(tasks: Promise<Task[]>) {
    super();
    this.tasks = tasks;
  }

  // constructor(
  //   title: string,
  //   // description: string,
  //   // status: boolean,
  //   // startDate: Date,
  //   // endDate: Date,
  //   // estimatedEndDate: Date,
  //   // photo: string,
  //   tasks: Task[]
  // ) {
  //   this.title = title;
  //   // this.description = description;
  //   // this.status = status;
  //   // this.startDate = startDate;
  //   // this.endDate = endDate;
  //   // this.estimatedEndDate = estimatedEndDate;
  //   // this.photo = photo;
  //   this.tasks = tasks;
  // }
}

@InputType()
export class ProjectInput {
  @Field((type) => ID, { nullable : true})
  id: number;

  @Field()
  title: string;

  @Field(() => [TaskInput], { nullable: true })
  tasks: Promise<TaskInput[]>;
}
