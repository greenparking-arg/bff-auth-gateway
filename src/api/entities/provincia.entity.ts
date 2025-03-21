import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Municipio } from './municipio.entity'; // Ajusta la ruta según tu estructura

@Entity('provincias')
export class Provincia {
  @PrimaryGeneratedColumn('uuid') // Clave primaria de tipo UUID
  id: string;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  nombre: string;

  @OneToMany(() => Municipio, (municipio) => municipio.provinciaRel)
  municipios: Municipio[];
}
