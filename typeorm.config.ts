import { environments } from './src/common/constants/environments';
import { typeormConfigs } from './src/configs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

export default new DataSource({
  ...(typeormConfigs[environments.PRODUCTION] as DataSourceOptions),
  entities: [`${process.cwd()}/**/*.entity.{ts,js}`],
  migrations: [`${process.cwd()}/migrations/*.{ts,js}`],
});
