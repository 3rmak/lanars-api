import { DynamicModule, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeStorage, Umzug } from 'umzug';
import * as path from 'path';

@Module({})
export class MigrationsModule {
  static register(): DynamicModule {
    return {
      module: MigrationsModule,
      imports: [SequelizeModule.forFeature()],
      providers: [
        {
          provide: 'AUTO_MIGRATION',
          useFactory: async (sequelize: Sequelize) => {
            const migrator = this.initMigrator(sequelize);
            await migrator.up();
          },
          inject: [Sequelize],
        },
      ],
    };
  }

  private static initMigrator(sequelize: Sequelize) {
    return new Umzug({
      migrations: {
        glob: ['migrations/*.ts', { cwd: path.join(process.cwd(), 'src', 'database') }],
        resolve: ({ name, path }) => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const migration = require(path);
          console.log(JSON.stringify(migration));
          return {
            name,
            up: async () => migration.up(sequelize.getQueryInterface()),
            down: async () => migration.down(sequelize.getQueryInterface()),
          };
        },
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize: sequelize }),
      logger: null,
    });
  }
}
