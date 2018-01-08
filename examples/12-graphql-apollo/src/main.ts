import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';


import { introspectSchema, makeRemoteExecutableSchema } from 'graphql-tools'
import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';

async function bootstrap() {

// init 
	const link = new HttpLink({ uri: 'http://api.githunt.com/graphql', fetch });
    const schema = await introspectSchema(link);
    const executableSchema = makeRemoteExecutableSchema({
      schema,
      link,
    })
    //const appModule = new ApplicationModule(null, null)


  const app = await NestFactory.create(ApplicationModule);
  await app.listen(3000);
}
bootstrap();
