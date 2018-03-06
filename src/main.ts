require('reflect-metadata');

import * as uuidv4 from 'uuid/v4';
import { createConnection, Connection } from "typeorm";

import { User } from './entity/user';

type MaybeUser = User | undefined;

class TestClass {

    protected connection: Connection;

    async run() {
        this.connection = await createConnection({
            "type": "mysql",
            "host": "localhost",
            "port": 33306,
            "username": "root",
            "password": "test-pw",
            "database": "testdb",
            "synchronize": true,
            "logging": false,
            "entities": [
                "dist/entity/*.js"
            ],
            "migrations": [
               "dist/migration/**/*.js"
            ],
            "subscribers": [
               "dist/subscriber/**/*.js"
            ],
            "cli": {
               "entitiesDir": "src/entity",
               "migrationsDir": "src/migration",
               "subscribersDir": "src/subscriber"
            }
        });

        const user = await this.newUser();
        console.log("Created user with id: " + user.id);
        this.storeUser(user);

        const user2 = await this.newUser();
        console.log("Created user2 with id: " + user2.id);
        this.storeUser(user2);

        const maybeUser = await this.findUserById(user.id);
        if (maybeUser !== undefined) {
            console.log("Found user: " + maybeUser.id);
        }
        const maybeUser1 = await this.findUserById('123');
        if (maybeUser1 !== undefined) {
            console.log("Found user: " + maybeUser1.id);
        } else {
            console.log("Did not find user 123");
        }

        try {
            await this.deleteUserById(user.id);
            console.log("Deleted user " + user.id);
        } catch (err) {
            console.error(err);
        }

        try {
            await this.deleteUserById('123');
            console.log("Deleted user 123");
        } catch (err) {
            console.error(err);
        }
    }


    public async newUser(): Promise<User> {
        const user: User = {
            id: uuidv4()
        };
        await this.storeUser(user);
        return user;
    }

    public async storeUser(newUser: User) {
        const userRepo = this.connection.getRepository<User>(User);
        await userRepo.save(newUser);
    }

    public async findUserById(id: string): Promise<MaybeUser> {
        const userRepo = this.connection.getRepository<User>(User);
        return await userRepo.findOneById(id);
    }

    public async deleteUserById(id: string): Promise<void> {
        const userRepo = this.connection.getRepository<User>(User);
        await userRepo.deleteById(id);
    }
}

const test = new TestClass();
test.run().then(() => {
    console.log("Success.");
}).catch((err: any) => {
    console.error(err);
})
