import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('forgot_password_verification')
export class ForgotPasswordVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column()
  exp: number;
}