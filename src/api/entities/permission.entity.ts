import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('permissions') // Nombre de la tabla en PostgreSQL
export class Permission {
  @PrimaryGeneratedColumn('uuid') // Clave primaria de tipo UUID
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name_public: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  group_permissions: string;
}