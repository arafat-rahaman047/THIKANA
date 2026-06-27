const bcrypt = require('bcryptjs');
const UserRepository = require('../repositories/user.repository');
const AppError = require('../utils/appError');
const { ROLE_IDS, HTTP_STATUS } = require('../configs/constants');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} = require('../utils/jwt.util');

const userRepository = new UserRepository();

class AuthService {
  /**
   * Registers a new user and their profile transactionally.
   * @param {Object} payload - Validated user & profile details
   */
  async register(payload) {
  const {
    email,
    phone,
    password,
    role,
    fullName,
    nidNumber,
    address,
    bio
  } = payload;

  // Extra safety guard in case this service is called without Joi middleware.
  if ((role === 'tenant' || role === 'owner') && !nidNumber) {
    throw new AppError('NID number is required for tenant and owner accounts', HTTP_STATUS.BAD_REQUEST);
  }

  if (!address) {
    throw new AppError('Address is required', HTTP_STATUS.BAD_REQUEST);
  }
    // 1. Check if email exists
    const existingEmail = await userRepository.findByEmailWithRole(email);
    if (existingEmail) {
      throw new AppError('Email address is already registered', HTTP_STATUS.CONFLICT);
    }

    // 2. Check if phone exists
    const existingPhone = await userRepository.findOne({ phone });
    if (existingPhone) {
      throw new AppError('Phone number is already registered', HTTP_STATUS.CONFLICT);
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Map role name to ID
    const roleId = ROLE_IDS[role];
    if (!roleId) {
      throw new AppError('Invalid user role specified', HTTP_STATUS.BAD_REQUEST);
    }

    // 5. Prepare user data and profile data
    const userData = {
      email,
      phone,
      password: hashedPassword,
      role_id: roleId,
      is_active: 1,
      is_verified: 0
    };

    const profileData = {
      full_name: fullName,
      nid_number: nidNumber || null,
      address: address || null,
      bio: bio || null,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`
    };

    // 6. Execute transactional insertion
    const userId = await userRepository.createWithProfile(userData, profileData);

    // Fetch and return the newly created user without password
    const createdUser = await userRepository.findByIdWithProfile(userId);
    return createdUser;
  }

  /**
   * Authenticates user credentials and returns tokens.
   * @param {String} email 
   * @param {String} password 
   */
  async login(email, password) {
    // 1. Fetch user by email
    const user = await userRepository.findByEmailWithRole(email);
    if (!user) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    // 3. Check if user is active
    if (!user.is_active) {
      throw new AppError('Your account has been suspended. Please contact support.', HTTP_STATUS.FORBIDDEN);
    }

    // 4. Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 5. Store refresh token in database
    await userRepository.updateRefreshToken(user.id, refreshToken);

    // 6. Get user profile
    const userProfile = await userRepository.findByIdWithProfile(user.id);

    return {
      tokens: {
        accessToken,
        refreshToken
      },
      user: userProfile
    };
  }

  /**
   * Invalidates user session by deleting the refresh token.
   * @param {Number} userId 
   */
  async logout(userId) {
    await userRepository.updateRefreshToken(userId, null);
    return true;
  }

  /**
   * Refreshes the access token using a valid refresh token.
   * @param {String} token 
   */
  async refresh(token) {
    // 1. Verify token signature and payload
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
    }

    // 2. Check if user exists and has this refresh token active
    const user = await userRepository.findByIdWithProfile(decoded.id);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.UNAUTHORIZED);
    }

    // Fetch the raw user to verify the refresh token column
    const rawUser = await userRepository.findById(decoded.id);
    if (!rawUser || rawUser.refresh_token !== token) {
      throw new AppError('Invalid refresh token or session expired', HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if user is still active
    if (!rawUser.is_active) {
      throw new AppError('User account is suspended', HTTP_STATUS.FORBIDDEN);
    }

    // 3. Generate a new pair of tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // 4. Update refresh token in DB
    await userRepository.updateRefreshToken(user.id, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }
}

module.exports = AuthService;
