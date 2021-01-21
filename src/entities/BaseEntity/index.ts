import * as joi from 'joi';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEnity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ update: false })
  createdAt: string | Date;

  @UpdateDateColumn({ update: false })
  updatedAt: string | Date;
}

export const baseSchema = {
  id: joi.string().optional(),
  createdAt: joi.string().optional(),
  updatedAt: joi.string().optional(),
};
