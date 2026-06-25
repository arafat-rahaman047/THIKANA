const db = require('../configs/db');

/**
 * Base Repository providing common database operations.
 */
class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = db;
  }

  /**
   * Find records matching conditions
   * @param {Object} conditions - Key-value conditions for WHERE clause
   * @returns {Promise<Array>} rows
   */
  async find(conditions = {}) {
    let sql = `SELECT * FROM ${this.tableName}`;
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    if (keys.length > 0) {
      const whereClause = keys.map(key => `\`${key}\` = ?`).join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }

    const [rows] = await this.db.query(sql, values);
    return rows;
  }

  /**
   * Find a single record matching conditions
   * @param {Object} conditions - Key-value conditions for WHERE clause
   * @returns {Promise<Object|null>} row
   */
  async findOne(conditions = {}) {
    let sql = `SELECT * FROM ${this.tableName}`;
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    if (keys.length > 0) {
      const whereClause = keys.map(key => `\`${key}\` = ?`).join(' AND ');
      sql += ` WHERE ${whereClause}`;
    }
    sql += ' LIMIT 1';

    const [rows] = await this.db.query(sql, values);
    return rows[0] || null;
  }

  /**
   * Find a record by its Primary Key
   * @param {Number|String} id 
   * @returns {Promise<Object|null>} row
   */
  async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`;
    const [rows] = await this.db.query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Insert a new record
   * @param {Object} data - Key-value pairs to insert
   * @returns {Promise<Number>} insertId
   */
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const escapedKeys = keys.map(key => `\`${key}\``).join(', ');

    const sql = `INSERT INTO ${this.tableName} (${escapedKeys}) VALUES (${placeholders})`;
    const [result] = await this.db.query(sql, values);
    return result.insertId;
  }

  /**
   * Update a record by ID
   * @param {Number|String} id 
   * @param {Object} data - Key-value pairs to update
   * @returns {Promise<Boolean>} success
   */
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `\`${key}\` = ?`).join(', ');

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    const [result] = await this.db.query(sql, [...values, id]);
    return result.affectedRows > 0;
  }

  /**
   * Delete a record by ID
   * @param {Number|String} id 
   * @returns {Promise<Boolean>} success
   */
  async delete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const [result] = await this.db.query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Custom raw query helper
   * @param {String} sql 
   * @param {Array} params 
   * @returns {Promise<Array>} query result
   */
  async query(sql, params = []) {
    const [rows] = await this.db.query(sql, params);
    return rows;
  }
}

module.exports = BaseRepository;
