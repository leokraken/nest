import { Component } from '@nestjs/common';
import { Cat } from './interfaces/cat.interface';

@Component()
export class CatsService {
  private readonly cats: Cat[] = [{ id: 1, name: 'Cat', age: 5, humanId: 10 }];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }

  findOneById(id: number): Cat {
    return this.cats.find(cat => cat.id === id);
  }

  findByHumanId(id: number): Cat {
    return this.cats.find(cat => cat.humanId === id)
  }
}
