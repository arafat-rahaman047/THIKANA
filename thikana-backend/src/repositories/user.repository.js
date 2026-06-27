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
             up.company_name, up.contact_person_name, up.date_of_birth, up.gender,
             up.occupation, up.institution_name, up.student_id_number,
             up.emergency_contact, up.city, up.area, up.profile_visibility,
             up.website_url, up.facebook_url, up.office_address,
             up.business_registration_number, up.years_of_experience,
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
   * Upsert a user profile record based on user_id
   * @param {Number|String} userId 
   * @param {Object} profileData 
   * @returns {Promise<Boolean>}
   */
  async upsertProfile(userId, profileData) {
    const data = { ...profileData, user_id: userId };
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const escapedKeys = keys.map(key => `\`${key}\``).join(', ');
    const updateClause = keys
      .filter(key => key !== 'user_id')
      .map(key => `\`${key}\` = VALUES(\`${key}\`)`)
      .join(', ');

    const sql = `
      INSERT INTO user_profiles (${escapedKeys}) 
      VALUES (${placeholders}) 
      ON DUPLICATE KEY UPDATE ${updateClause}
    `;
    await this.query(sql, values);
    return true;
  }

  /**
   * Update the profile avatar path in database
   * @param {Number|String} userId 
   * @param {String} avatarUrl 
   * @returns {Promise<Boolean>}
   */
  async updateAvatar(userId, avatarUrl) {
    const [rows] = await this.db.query('SELECT 1 FROM user_profiles WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      // Stub profile creation
      const [u] = await this.db.query('SELECT email FROM users WHERE id = ?', [userId]);
      const name = u[0] ? u[0].email.split('@')[0] : 'User';
      await this.db.query(
        'INSERT INTO user_profiles (user_id, full_name, avatar_url) VALUES (?, ?, ?)',
        [userId, name, avatarUrl]
      );
    } else {
      await this.db.query(
        'UPDATE user_profiles SET avatar_url = ? WHERE user_id = ?',
        [avatarUrl, userId]
      );
    }
    return true;
  }

  /**
   * Retrieve safe public profile information for a user
   * @param {Number|String} id 
   * @returns {Promise<Object|null>} public profile record
   */
  async findPublicProfileById(id) {
    const sql = `
      SELECT u.id, u.is_verified, r.name as role, u.created_at as joined_at,
             up.full_name, up.company_name, up.contact_person_name, up.avatar_url,
             up.city, up.area, up.bio, up.profile_visibility,
             up.occupation, up.institution_name, up.years_of_experience,
             up.website_url, up.facebook_url
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? LIMIT 1
    `;
    const rows = await this.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Fetch the count of active property listings by a landlord / owner
   * @param {Number|String} userId 
   * @returns {Promise<Number>} count of active properties
   */
  async getPropertyCountByUserId(userId) {
    const sql = `SELECT COUNT(*) as count FROM properties WHERE owner_id = ? AND status = 'active'`;
    const rows = await this.query(sql, [userId]);
    return rows[0] ? rows[0].count : 0;
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
