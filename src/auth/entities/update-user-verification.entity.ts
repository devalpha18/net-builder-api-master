import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('update_user_verification')
export class UpdateUserVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  code: string;

  @Column()
  exp: number;
}
