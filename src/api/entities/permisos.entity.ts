import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('permisos') // Nombre de la tabla en PostgreSQL
export class Permisos {
  @PrimaryGeneratedColumn() // Clave primaria de tipo UUID
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name_public: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  group_permisos: string;
}
