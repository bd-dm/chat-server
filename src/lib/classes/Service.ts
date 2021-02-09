import { Repository } from 'typeorm';

export default abstract class Service<Entity> {
  protected repository: Repository<Entity>;

  protected constructor(repository: Repository<Entity>) {
    this.repository = repository;
  }
}
