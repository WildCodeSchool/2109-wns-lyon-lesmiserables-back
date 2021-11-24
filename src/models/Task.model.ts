import "reflect-metadata";
import { Field, ID, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { CheckList } from "./CheckList.model";
import { Label } from "./Label.model";
import { Project } from "./Project.model";

@ObjectType()
@Entity()
export class Task extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @ManyToOne(() => Project, (project) => project.tasks)
  project: Project;

  constructor(project: Project) {
    super();
    this.project = project;
  }

  //   @Field()
  //   status: boolean;

  //   @Field({ nullable: true })
  //   comment?: string;

  //   @Field()
  //   startDate: Date;

  //   @Field({ nullable: true })
  //   endDate: Date;

  //   @Field({ nullable: true })
  //   duration: string;

  //   @Field((type) => CheckList, { nullable: true })
  //   checkList: CheckList;

  //   @Field((type) => [Label], { nullable: true })
  //   labels: Label[];

  // constructor(
  //   title: string
  //   // status: boolean,
  //   // comment: string,
  //   // startDate: Date,
  //   // endDate: Date,
  //   // duration: string,
  //   // checkList: CheckList,
  //   // labels: Label[]
  // ) {
  //   this.title = title;
  //   // this.status = status;
  //   // this.comment = comment;
  //   // this.startDate = startDate;
  //   // this.endDate = endDate;
  //   // this.duration = duration;
  //   // this.checkList = checkList;
  //   // this.labels = labels;
  // }
}

@InputType()
export class TaskInput {
  @Field((type) => ID)
  id: number;

  @Field()
  title: string;
}
