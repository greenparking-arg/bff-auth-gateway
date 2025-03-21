import { Injectable, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity'; // Ajusta la ruta
import { Rol } from '../entities/rol.entity'; // Ajusta la ruta
import { PersonalToken } from '../entities/personal-token.entity'; // Ajusta la ruta
import { CreateUserDto } from './dto/create-user.dto';
import { Payload } from '../auth/auth.service'; // Ajusta la ruta
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    public readonly userRepository: Repository<User>,

    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,

    @InjectRepository(PersonalToken)
    private readonly personalTokenRepository: Repository<PersonalToken>,
  ) {}

  /**
   * Crea un nuevo token personal activo para el usuario especificado, desactivando cualquier token activo existente.
   * @param {Payload} payload - El payload con los detalles del usuario y el valor del nuevo token.
   * @returns {Promise<PersonalToken>} - El token personal creado.
   */
  async createActivePersonalToken(payload: Payload): Promise<PersonalToken> {
    this.logger.log(
      `Creando token personal activo para el usuario con ID: ${payload.id}, valor del token: ${payload.value}`,
    );
    try {
      await this.personalTokenRepository.update({ user: { id: payload.id }, active: true }, { active: false });
      const data = this.personalTokenRepository.create({
        token: payload.value,
        lastSession: dayjs().toISOString(),
        active: true,
        attempts: 0,
        user: { id: payload.id },
      });
      const savedToken = await this.personalTokenRepository.save(data);
      this.logger.log(`Token personal activo creado exitosamente para el usuario con ID: ${payload.id}`);
      return savedToken;
    } catch (error) {
      this.logger.error(`Error al crear token personal activo para el usuario con ID: ${payload.id}`, error.stack);
      throw error;
    }
  }

  /**
   * Busca un usuario por su email.
   * @param {string} email - El email del usuario a buscar.
   * @returns {Promise<User | null>} - El usuario encontrado o null si no existe.
   */
  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Buscando usuario por email: ${email}`);
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['rol', 'municipio'],
      });
      if (user) {
        this.logger.log(`Usuario encontrado con email: ${email}`);
      } else {
        this.logger.log(`No se encontró usuario con email: ${email}`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por email: ${email}`, error.stack);
      throw error;
    }
  }

  /**
   * Busca un usuario por su ID.
   * @param {number} id - El ID del usuario a buscar.
   * @returns {Promise<User | null>} - El usuario encontrado o null si no existe.
   */
  async findById(id: number): Promise<User | null> {
    this.logger.log(`Buscando usuario por ID: ${id}`);
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (user) {
        this.logger.log(`Usuario encontrado con ID: ${id}`);
      } else {
        this.logger.log(`No se encontró usuario con ID: ${id}`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por ID: ${id}`, error.stack);
      throw error;
    }
  }

  /**
   * Busca permisos basados en un rol.
   * @param {Rol} role - El rol para buscar permisos.
   * @returns {Promise<Rol | undefined>} - El rol con permisos o undefined si no se proporciona rol.
   */
  async findByRolePermisos(role?: Rol): Promise<Rol | undefined> {
    if (!role) {
      this.logger.log('No se proporcionó un rol para buscar permisos');
      return undefined;
    }
    this.logger.log(`Buscando permisos para el rol con ID: ${role.id}`);
    try {
      const roleWithPermisoss = await this.rolRepository.findOne({
        where: { id: role.id },
        relations: ['Permisoss'],
      });
      if (roleWithPermisoss) {
        this.logger.log(`Permisos encontrados para el rol con ID: ${role.id}`);
      } else {
        this.logger.log(`No se encontró rol con ID: ${role.id}`);
      }
      return roleWithPermisoss;
    } catch (error) {
      this.logger.error(`Error al buscar permisos para el rol con ID: ${role.id}`, error.stack);
      throw error;
    }
  }

  /**
   * Busca un usuario por su token personal.
   * @param {Payload} payload - El payload con el token personal y el ID del usuario.
   * @returns {Promise<User | null>} - El usuario asociado al token o null si es inválido/inactivo.
   */
  async findByUserTokenPersonal(payload: Payload): Promise<User | null> {
    this.logger.log(`Buscando usuario por token personal: ${payload.value}`);
    try {
      const personalToken = await this.personalTokenRepository.findOne({
        where: { token: payload.value },
      });
      if (!personalToken || !personalToken.active || personalToken.attempts !== 0) {
        this.logger.log(`Token inválido o inactivo: ${payload.value}`);
        await this.personalTokenRepository.update({ user: { id: payload.id }, active: true }, { active: false });
        return null;
      }
      const user = await this.userRepository.findOne({
        where: { id: personalToken.user.id },
        relations: ['rol', 'municipio'],
      });
      this.logger.log(`Usuario encontrado para el token: ${payload.value}`);
      return user;
    } catch (error) {
      this.logger.error(`Error al buscar usuario por token personal: ${payload.value}`, error.stack);
      throw error;
    }
  }

  /**
   * Inactiva todos los tokens personales activos de un usuario.
   * @param {Payload} payload - El payload con el ID del usuario.
   * @returns {Promise<boolean>} - True si se inactivaron tokens, false si no.
   */
  async findByUserTokenPersonalLogout(payload: Payload): Promise<boolean> {
    this.logger.log(`Inactivando tokens personales activos para el usuario con ID: ${payload.id}`);
    try {
      const updateResult = await this.personalTokenRepository.update(
        { user: { id: payload.id }, active: true },
        { active: false },
      );
      const success = updateResult.affected > 0;
      this.logger.log(`Tokens personales inactivados para el usuario con ID: ${payload.id}: ${success}`);
      return success;
    } catch (error) {
      this.logger.error(`Error al inactivar tokens personales para el usuario con ID: ${payload.id}`, error.stack);
      throw error;
    }
  }

  /**
   * Verifica si un usuario existe por su identificador o email.
   * @param {string} userIdentifier - El identificador del usuario (DNI).
   * @param {string} email - El email del usuario.
   * @returns {Promise<{ exists: boolean; userIdentifierExists: boolean; emailExists: boolean }>} - Resultado de la verificación.
   */
  async checkIfExists(
    userIdentifier: string,
    email: string,
  ): Promise<{
    exists: boolean;
    userIdentifierExists: boolean;
    emailExists: boolean;
  }> {
    this.logger.log(`Verificando existencia de usuario con identificador: ${userIdentifier} o email: ${email}`);
    try {
      const userIdentifierExists = await this.userRepository.findOne({ where: { dni: userIdentifier } });
      const emailExists = await this.userRepository.findOne({ where: { email } });
      const exists = !!(userIdentifierExists || emailExists);
      this.logger.log(
        `Resultado de la verificación: exists=${exists}, identificador=${!!userIdentifierExists}, email=${!!emailExists}`,
      );
      return {
        exists,
        userIdentifierExists: !!userIdentifierExists,
        emailExists: !!emailExists,
      };
    } catch (error) {
      this.logger.error(
        `Error al verificar existencia de usuario con identificador: ${userIdentifier} o email: ${email}`,
        error.stack,
      );
      throw new HttpException('Número de documento o correo ya registrado', HttpStatus.OK);
    }
  }

  /**
   * Crea un nuevo usuario basado en el DTO proporcionado.
   * @param {CreateUserDto} createUserDto - El DTO con los datos del usuario.
   * @returns {Promise<User>} - El usuario creado.
   * @throws {BadRequestException} - Si el email ya está registrado.
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { nombre, email, password, rolId, dni } = createUserDto;
    this.logger.log(`Creando usuario con email: ${email}, identificador: ${dni}`);
    try {
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        this.logger.warn(`Email ya registrado: ${email}`);
        throw new BadRequestException('El email ya está registrado');
      }
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = this.userRepository.create({
        nombre,
        email,
        password: hashedPassword,
        rol: { id: rolId },
        dni,
      });
      const savedUser = await this.userRepository.save(user);
      this.logger.log(`Usuario creado exitosamente con email: ${email}`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error al crear usuario con email: ${email}`, error.stack);
      throw error;
    }
  }

  /**
   * Refresca el token personal activo de un usuario. Si existe, lo actualiza; si no, crea uno nuevo.
   * @param {Payload} payload - El payload con los detalles del usuario y el valor del token.
   * @returns {Promise<PersonalToken>} - El token personal actualizado o creado.
   */
  async refreshActivePersonalToken(payload: Payload): Promise<PersonalToken> {
    this.logger.log(`Refrescando token personal activo para el usuario con ID: ${payload.id}`);
    try {
      const activeToken = await this.personalTokenRepository.findOne({
        where: { user: { id: payload.id }, active: true },
      });
      if (activeToken) {
        activeToken.lastSession = dayjs().toISOString();
        activeToken.attempts = 0;
        const updatedToken = await this.personalTokenRepository.save(activeToken);
        this.logger.log(`Token personal activo refrescado para el usuario con ID: ${payload.id}`);
        return updatedToken;
      } else {
        const newToken = this.personalTokenRepository.create({
          token: payload.value,
          lastSession: dayjs().toISOString(),
          active: true,
          attempts: 0,
          user: { id: payload.id },
        });
        const savedToken = await this.personalTokenRepository.save(newToken);
        this.logger.log(`Nuevo token personal activo creado para el usuario con ID: ${payload.id}`);
        return savedToken;
      }
    } catch (error) {
      this.logger.error(`Error al refrescar token personal activo para el usuario con ID: ${payload.id}`, error.stack);
      throw error;
    }
  }
}
