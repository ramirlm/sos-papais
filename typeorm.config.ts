import { environments } from './src/common/constants/environments';
import { typeormConfigs } from './src/configs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

export default new DataSource({
  ...(typeormConfigs[process.env.NODE_ENV || environments.DEVELOPMENT] as DataSourceOptions),
  entities: [`${process.cwd()}/**/*.entity.ts`],
  migrations: [`${process.cwd()}/migrations/*.ts`],
});
