import "reflect-metadata";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class CheckList {
  @Field((type) => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description: string;

  @Field()
  status: boolean;

  constructor(title: string, description: string, status: boolean) {
    this.title = title;
    this.description = description;
    this.status = status;
  }
}
