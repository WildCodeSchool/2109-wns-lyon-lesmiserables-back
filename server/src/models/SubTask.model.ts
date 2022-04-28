import "reflect-metadata";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class SubTask {
  @Field((type) => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  status: boolean;

  constructor(title: string, status: boolean) {
    this.title = title;
    this.status = status;
  }
}
