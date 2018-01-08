import { Component, UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, DelegateProperty } from '@nestjs/graphql';

import { Cat } from './interfaces/cat.interface';
import { CatsService } from './cats.service';
import { CatsGuard } from './cats.guard';
import { MergeInfo } from 'graphql-tools/dist/Interfaces';

@Resolver('Cat')
export class CatsResolvers {
  constructor(private readonly catsService: CatsService) {}

  @Query()
  @UseGuards(CatsGuard)
  async getCats() {
    return await this.catsService.findAll();
  }

  @Query('cat')
  async findOneById(request, args: any) {
    return await this.catsService.findOneById(Number(args.id));
  }

  @Query()
  async catByHumanId(request, args: any) {
    return await this.catsService.findByHumanId(Number(args.id));
  }

  @Mutation('createCat')
  async create(cat: Cat) {
    await this.catsService.create(cat);
  }

  @DelegateProperty('address')
  getAddress() {
    return (mergeInfo: MergeInfo) => ({
      fragment: `fragment CatFragment on Cat { id }`,
      resolve(parent, args, context, info) {
        console.log(parent)
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
    });
  }
}
