const BaseRepository = require('./base.repository');

/**
 * Repository layer handling User operations.
 */
class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  /**
   * Find user by email and join role name
   * @param {String} email 
   * @returns {Promise<Object|null>} user details with role
   */
  async findByEmailWithRole(email) {
    const sql = `
      SELECT u.*, r.name as role 
      FROM users u 
      INNER JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? LIMIT 1
    `;
    const rows = await this.query(sql, [email]);
    return rows[0] || null;
  }

  /**
   * Find user by ID and join profile + role details
   * @param {Number|String} id 
   * @returns {Promise<Object|null>} complete user details
   */
  async findByIdWithProfile(id) {
    const sql = `
      SELECT u.id, u.email, u.phone, u.is_active, u.is_verified, r.name as role,
             up.full_name, up.avatar_url, up.nid_number, up.address, up.bio,
             u.created_at, u.updated_at
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? LIMIT 1
    `;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Transactional register: Creates user and user profile
   * @param {Object} userData 
   * @param {Object} profileData 
   * @returns {Promise<Number>} insertId of the user
   */
  async createWithProfile(userData, profileData) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert into users
      const userKeys = Object.keys(userData);
      const userValues = Object.values(userData);
      const userPlaceholders = userKeys.map(() => '?').join(', ');
      const userEscapedKeys = userKeys.map(key => `\`${key}\``).join(', ');

      const userSql = `INSERT INTO users (${userEscapedKeys}) VALUES (${userPlaceholders})`;
      const [userResult] = await connection.query(userSql, userValues);
      const userId = userResult.insertId;

      // 2. Insert into user_profiles
      profileData.user_id = userId;
      const profileKeys = Object.keys(profileData);
      const profileValues = Object.values(profileData);
      const profilePlaceholders = profileKeys.map(() => '?').join(', ');
      const profileEscapedKeys = profileKeys.map(key => `\`${key}\``).join(', ');

      const profileSql = `INSERT INTO user_profiles (${profileEscapedKeys}) VALUES (${profilePlaceholders})`;
      await connection.query(profileSql, profileValues);

      await connection.commit();
      return userId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update the stored refresh token for a user
   * @param {Number} id 
   * @param {String|null} refreshToken 
   * @returns {Promise<Boolean>}
   */
  async updateRefreshToken(id, refreshToken) {
    return this.update(id, { refresh_token: refreshToken });
  }
}

module.exports = UserRepository;
