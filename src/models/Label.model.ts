import "reflect-metadata";
import { Field, ID, ObjectType } from "type-graphql";
import { Task } from "./Task.model";

@ObjectType()
export class Label {
  @Field((type) => ID)
  id: string;

  @Field()
  title: string;

  @Field((type) => [Task], { nullable: true })
  tasks: Task[];

  constructor(title: string, tasks: Task[]) {
    this.title = title;
    this.tasks = tasks;
  }
}
