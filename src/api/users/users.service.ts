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
   * Creates a new active personal token for the specified user by deactivating any existing active tokens
   * and storing the new token in the database.
   *
   * @param {Payload} payload - The payload containing user details and the new token value.
   */
  async createActivePersonalToken(payload: Payload) {
    await this.personalTokenRepository.update({ user: { id: payload.id }, active: true }, { active: false });

    const data = this.personalTokenRepository.create({
      token: payload.value,
      lastSession: dayjs().toISOString(),
      active: true,
      attempts: 0,
      user: { id: payload.id },
    });
    return this.personalTokenRepository.save(data);
  }

  /**
   * Finds a user by their email.
   *
   * @param {string} email - The email of the user to find.
   * @returns {Promise<User | null>} - A promise that resolves with a User object if found, or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['rol','municipio'],
    });
  }

  /**
   * Finds a user by their unique identifier.
   *
   * @param {number} id - The unique identifier of the user.
   * @return {Promise<User | null>} A promise that resolves to the user if found, or null if not found.
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * Finds a permission based on the given role.
   *
   * @param {Rol} role - The role to search for permissions.
   */
  async findByRolePermission(role?: Rol) {
    if (!role) {
      return undefined;
    }

    return this.rolRepository.findOne({
      where: { id: role.id },
      relations: ['permissions'], // Ajusta según las relaciones en tu entidad
    });
  }

  /**
   * Finds a user by their personal token.
   *
   * @param {Payload} payload - The payload containing the user's personal token and ID.
   * @return {Promise<User | null>} - The user associated with the token, or null if the token is invalid or inactive.
   */
  async findByUserTokenPersonal(payload: Payload): Promise<User | null> {
    const personalToken = await this.personalTokenRepository.findOne({
      where: { token: payload.value },
    });

    if (!personalToken || !personalToken.active || personalToken.attempts !== 0) {
      await this.personalTokenRepository.update({ user: { id: payload.id }, active: true }, { active: false });
      return null;
    }

    return this.userRepository.findOne({
      where: { id: personalToken.user.id },
      relations: ['rol', 'municipio'], // Ajusta según las relaciones
    });
  }

  /**
   * Inactivates all active personal tokens for a given user.
   *
   * @param {Payload} payload - The payload containing the user's ID whose personal tokens are to be inactivated.
   * @return {Promise<boolean>} - A Promise that resolves to true if one or more tokens were inactivated, otherwise false.
   */
  async findByUserTokenPersonalLogout(payload: Payload): Promise<boolean> {
    const updateResult = await this.personalTokenRepository.update(
      { user: { id: payload.id }, active: true },
      { active: false },
    );

    return updateResult.affected > 0;
  }

  /**
   * Checks if a user exists by its user identifier and email.
   *
   * @param {string} userIdentifier - The business identifier of the user.
   * @param {string} email - The business identifier of the user.
   * @returns {Promise<{ exists: boolean; userIdentifierExists: boolean; emailExists: boolean }>} - An object indicating whether the userIdentifier or email exists.
   * @throws {HttpException} - If the database query fails.
   */
  async checkIfExists(
    userIdentifier: string,
    email: string,
  ): Promise<{
    exists: boolean;
    userIdentifierExists: boolean;
    emailExists: boolean;
  }> {
    try {
      const userIdentifierExists = await this.userRepository.findOne({ where: { dni: userIdentifier } });
      const emailExists = await this.userRepository.findOne({ where: { email } });

      const exists = !!(userIdentifierExists || emailExists);

      return {
        exists,
        userIdentifierExists: !!userIdentifierExists,
        emailExists: !!emailExists,
      };
    } catch (e) {
      this.logger.error(
        `Error checking existence of user with userIdentifier ${userIdentifier} or email ${email}: ${e.message}`,
        e.stack,
      );
      throw new HttpException('Número de documento o correo ya registrado', HttpStatus.OK);
    }
  }

  /**
   * Creates a new user based on the provided CreateUserDto.
   *
   * @param {CreateUserDto} createUserDto - The data transfer object containing user creation data.
   * @returns {Promise<User>} - The newly created user.
   * @throws {BadRequestException} - If the email is already registered.
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { nombre, email, password, rolId, dni, municipioId } = createUserDto;

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el nuevo usuario
    const user = this.userRepository.create({
      nombre,
      email,
      password: hashedPassword,
      rol: { id: rolId },
      municipio: { id: municipioId },
      dni,
    });

    return this.userRepository.save(user);
  }

  /**
   * Refreshes the active personal token for the specified user.
   * If an active token exists, it updates its properties (lastSession and attempts).
   * If no active token exists, it creates a new one.
   *
   * @param {Payload} payload - The payload containing user details and the new token value.
   * @returns {Promise<PersonalToken>} - The refreshed or newly created personal token.
   */
  async refreshActivePersonalToken(payload: Payload): Promise<PersonalToken> {
    // Buscar el token personal activo para el usuario
    const activeToken = await this.personalTokenRepository.findOne({
      where: { user: { id: payload.id }, active: true },
    });

    if (activeToken) {
      // Si existe un token activo, actualizar sus propiedades
      activeToken.lastSession = dayjs().toISOString();
      activeToken.attempts = 0; // Reiniciar intentos, ajusta según tu lógica
      return this.personalTokenRepository.save(activeToken);
    } else {
      // Si no existe un token activo, crear uno nuevo
      const newToken = this.personalTokenRepository.create({
        token: payload.value,
        lastSession: dayjs().toISOString(),
        active: true,
        attempts: 0,
        user: { id: payload.id },
      });
      return this.personalTokenRepository.save(newToken);
    }
  }
}
