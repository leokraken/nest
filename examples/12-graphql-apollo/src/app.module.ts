import {
  Module,
  MiddlewaresConsumer,
  NestModule,
  RequestMethod,
  Inject
} from '@nestjs/common';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { GraphQLModule, GraphQLFactory } from '@nestjs/graphql';

import { CatsModule } from './cats/cats.module';

import { introspectSchema, makeRemoteExecutableSchema, mergeSchemas } from 'graphql-tools'
import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';




const AsyncProviders = [
{
  provide: 'LinkSchema',
  useFactory: async () => {
    console.log('using factory async')

    const fetcher = async ({ query, variables, operationName, context }) => {
      const fetchResult = await fetch('http://159.203.96.223/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables, operationName })
      });

      return fetchResult.json();
    };


    //const link = new HttpLink({ uri: 'https://api.github.com/graphql', fetch });
    const schema = await introspectSchema(fetcher);
    const executableSchema = makeRemoteExecutableSchema({
      schema,
      fetcher
    })
    return executableSchema;
  }
},
];

@Module({
  components: [...AsyncProviders],
  imports: [CatsModule, GraphQLModule],
})
export class ApplicationModule implements NestModule {
  schema: any

  constructor(private readonly graphQLFactory: GraphQLFactory, @Inject('LinkSchema') private readonly linkSchema: any) {
    console.log('init constructor')
    //this.schema = options? options.schema : null
  }

  configure(consumer: MiddlewaresConsumer) {
    const linkTypeDefs = `extend type Cat {address: Address}`
    const delegates = this.graphQLFactory.createDelegates();
    const schema = mergeSchemas({schemas:[this.linkSchema, this.createSchema(), linkTypeDefs], resolvers: delegates/*, resolvers:mergeInfo=>({
      Cat:{
        address:{
          fragment: `fragment CatFragment on Cat { id }`,
          resolve(parent, args, context, info) {
            console.log(args)
            return mergeInfo.delegate(
              'query',
              'Address',
              {
                locale: 'es',
              },
              context,
              info,
              );
          },
        }
      }

    })*/}) //.linkSchema || this.createSchema();
    consumer
    .apply(graphiqlExpress({ endpointURL: '/graphql' }))
    .forRoutes({ path: '/graphiql', method: RequestMethod.GET })
    .apply(graphqlExpress(req => ({ schema, rootValue: req })))
    .forRoutes({ path: '/graphql', method: RequestMethod.ALL });
  }

  createSchema() {
    const typeDefs = this.graphQLFactory.mergeTypesByPaths('./**/*.graphql');
    const schema = this.graphQLFactory.createSchema({ typeDefs });
    return this.graphQLFactory.createSchema({ typeDefs });
  }

}
