import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Provincia } from './provincia.entity'; // Ajusta la ruta según tu estructura

@Entity('municipios')
export class Municipio {
  @PrimaryGeneratedColumn('uuid') // Clave primaria de tipo UUID
  id: string;

  @Column({
    type: 'character varying',
    length: 100,
    nullable: false,
    unique: true,
  })
  nombre: string;

  @Column({
    type: 'integer',
    name: 'id_provincia',
    nullable: false,
  })
  idProvincia: number;

  @Column({
    type: 'character varying',
    nullable: false,
  })
  provincia: string;

  @ManyToOne(() => Provincia, (provincia) => provincia.municipios)
  @JoinColumn({ name: 'id_provincia' })
  provinciaRel: Provincia;
}
