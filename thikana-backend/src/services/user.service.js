const UserRepository = require('../repositories/user.repository');
const AppError = require('../utils/appError');
const { HTTP_STATUS } = require('../configs/constants');

const userRepository = new UserRepository();

class UserService {
  /**
   * Fetch complete private profile for logged-in user
   * @param {Number|String} userId 
   */
  async getMe(userId) {
    const user = await userRepository.findByIdWithProfile(userId);
    if (!user) {
      throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }

  /**
   * Create or update logged-in user profile details
   * @param {Number|String} userId 
   * @param {String} role 
   * @param {Object} profileData 
   */
  async updateMe(userId, role, profileData) {
    // 1. Role-specific validation
    if (role === 'tenant' || role === 'owner') {
      if (!profileData.full_name || !profileData.full_name.trim()) {
        throw new AppError('Full name is required for tenant/owner profiles', HTTP_STATUS.BAD_REQUEST);
      }
      // Ensure we don't accidentally save company_name or office_address on tenant/owner profiles
      delete profileData.company_name;
      delete profileData.contact_person_name;
      delete profileData.office_address;
      delete profileData.business_registration_number;
    } else if (role === 'agency') {
      if (!profileData.company_name || !profileData.company_name.trim()) {
        throw new AppError('Company name is required for agency profiles', HTTP_STATUS.BAD_REQUEST);
      }
      // Ensure we don't save tenant/owner specific details on agency
      delete profileData.full_name;
      delete profileData.date_of_birth;
      delete profileData.gender;
      delete profileData.student_id_number;
      delete profileData.institution_name;
    }

    // 2. Perform database upsert
    await userRepository.upsertProfile(userId, profileData);

    // 3. Return the fully updated profile
    return this.getMe(userId);
  }

  /**
   * Upload user profile avatar photo
   * @param {Number|String} userId 
   * @param {String} filename 
   */
  async uploadAvatar(userId, filename) {
    if (!filename) {
      throw new AppError('No avatar file provided', HTTP_STATUS.BAD_REQUEST);
    }

    const avatarUrl = `/uploads/${filename}`;
    await userRepository.updateAvatar(userId, avatarUrl);

    return this.getMe(userId);
  }

  /**
   * Fetch sanitized public profile details for any user
   * @param {Number|String} id 
   */
  async getPublicProfile(id) {
    const rawProfile = await userRepository.findPublicProfileById(id);
    if (!rawProfile) {
      throw new AppError('User profile not found', HTTP_STATUS.NOT_FOUND);
    }

    const role = rawProfile.role?.toLowerCase();
    
    // Construct default display name from rawProfile fields or fallback email prefix
    let displayName = '';
    if (role === 'agency') {
      displayName = rawProfile.company_name || 'Agency User';
    } else {
      displayName = rawProfile.full_name || 'User';
    }

    // Standard public-safe profile base fields
    const publicProfile = {
      id: rawProfile.id,
      role: rawProfile.role,
      display_name: displayName,
      avatar_url: rawProfile.avatar_url,
      city: rawProfile.city,
      area: rawProfile.area,
      is_verified: rawProfile.is_verified === 1 || rawProfile.is_verified === true,
      joined_at: rawProfile.joined_at
    };

    // Profile visibility enforcement: hide bio/socials if profile visibility is set to 'limited'
    const isVisibilityLimited = rawProfile.profile_visibility === 'limited';
    if (!isVisibilityLimited) {
      publicProfile.bio = rawProfile.bio;
    } else {
      publicProfile.bio = null;
    }

    // Role-specific public information exposure
    if (role === 'tenant') {
      publicProfile.full_name = rawProfile.full_name;
      publicProfile.occupation = rawProfile.occupation;
      publicProfile.institution_name = rawProfile.institution_name || null;
    } else if (role === 'owner') {
      publicProfile.full_name = rawProfile.full_name;
      publicProfile.occupation = rawProfile.occupation;
      publicProfile.years_of_experience = rawProfile.years_of_experience;
      publicProfile.property_count = await userRepository.getPropertyCountByUserId(id);
    } else if (role === 'agency') {
      publicProfile.company_name = rawProfile.company_name;
      publicProfile.contact_person_name = rawProfile.contact_person_name || null;
      publicProfile.years_of_experience = rawProfile.years_of_experience;
      publicProfile.property_count = await userRepository.getPropertyCountByUserId(id);

      if (!isVisibilityLimited) {
        publicProfile.website_url = rawProfile.website_url;
        publicProfile.facebook_url = rawProfile.facebook_url;
      } else {
        publicProfile.website_url = null;
        publicProfile.facebook_url = null;
      }
    }

    return publicProfile;
  }
}

module.exports = UserService;
