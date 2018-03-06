import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class User {
    @PrimaryColumn("varchar")
    id: string;

    @Column()
    avatarUrl?: string;
}