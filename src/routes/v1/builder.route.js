import express from 'express';
import flexibleAuth from '../../middlewares/flexibleAuth.js';
import validate from '../../middlewares/validate.js';
import { uploadSingleDocument, uploadMultipleDocuments, uploadDocumentFields } from '../../middlewares/builderUpload.js';
import * as builderValidation from '../../validations/builder.validation.js';
import * as builderController from '../../controllers/builder.controller.js';

const router = express.Router();

// Basic CRUD routes (Admin only)
router
  .route('/')
  .post(flexibleAuth('manageBuilders'), validate(builderValidation.createBuilder), builderController.createBuilder)
  .get(flexibleAuth(), validate(builderValidation.getBuilders), builderController.getBuilders);

router
  .route('/:builderId')
  .get(flexibleAuth(), validate(builderValidation.getBuilder), builderController.getBuilder)
  .patch(flexibleAuth('manageBuilders'), validate(builderValidation.updateBuilder), builderController.updateBuilder)
  .delete(flexibleAuth('manageBuilders'), validate(builderValidation.deleteBuilder), builderController.deleteBuilder);

// Authentication routes (Public)
router.post('/login', validate(builderValidation.login), builderController.login);
router.post('/register', validate(builderValidation.register), builderController.register);

// New 4-layer registration flow
router.post('/check-email', validate(builderValidation.checkEmail), builderController.checkEmail);
router.post('/create-password', validate(builderValidation.createPassword), builderController.createPassword);

// OTP-based registration flow
router.post('/register-with-otp', validate(builderValidation.registerWithPasswordAndSendOTP), builderController.registerWithOTP);
router.post('/verify-registration-otp', validate(builderValidation.verifyRegistrationOTP), builderController.verifyRegistrationOTP);
router.post('/complete-registration', validate(builderValidation.completeRegistrationWithProfile), builderController.completeRegistrationWithProfile);

// OTP-based login flow
router.post('/login-with-otp', validate(builderValidation.loginWithPasswordAndSendOTP), builderController.loginWithOTP);
router.post('/complete-login-otp', validate(builderValidation.completeLoginWithOTP), builderController.completeLoginWithOTP);

// Password reset flow
router.post('/forgot-password', validate(builderValidation.sendForgotPasswordOTP), builderController.sendForgotPasswordOTP);
router.post('/verify-forgot-password-otp', validate(builderValidation.verifyForgotPasswordOTP), builderController.verifyForgotPasswordOTP);
router.post('/reset-password', validate(builderValidation.resetPasswordWithVerifiedOTP), builderController.resetPasswordWithOTP);

// Profile routes (Authenticated builders)
router
  .route('/profile')
  .get(flexibleAuth(), builderController.getProfile)
  .patch(flexibleAuth(), validate(builderValidation.updateProfile), builderController.updateProfile);

router.post('/change-password', flexibleAuth(), validate(builderValidation.changePassword), builderController.changePassword);

// Builder status management (Authenticated builders)
router.post('/submit-for-review', flexibleAuth(), builderController.submitForReview);
router.post('/reset-to-draft', flexibleAuth(), builderController.resetToDraft);

// Admin operations for builder approval
router.patch('/:builderId/approve', flexibleAuth('manageBuilders'), validate(builderValidation.approveBuilder), builderController.approveBuilder);
router.patch('/:builderId/reject', flexibleAuth('manageBuilders'), validate(builderValidation.rejectBuilder), builderController.rejectBuilder);

// Team member management (Authenticated builders)
router
  .route('/team-members')
  .post(flexibleAuth(), validate(builderValidation.addTeamMember), builderController.addTeamMember)
  .get(flexibleAuth(), builderController.getTeamMembers);

router
  .route('/team-members/:memberId')
  .get(flexibleAuth(), validate(builderValidation.getTeamMember), builderController.getTeamMember)
  .patch(flexibleAuth(), validate(builderValidation.updateTeamMember), builderController.updateTeamMember)
  .delete(flexibleAuth(), validate(builderValidation.removeTeamMember), builderController.removeTeamMember);

// Team member authentication (Public)
router.post('/team-members/login', validate(builderValidation.teamMemberLogin), builderController.teamMemberLogin);

// Admin operations
router.patch('/:builderId/deactivate', flexibleAuth('manageBuilders'), builderController.deactivateBuilder);
router.patch('/:builderId/activate', flexibleAuth('manageBuilders'), builderController.activateBuilder);
router.get('/stats', flexibleAuth('getBuilders'), builderController.getBuilderStats);

// Document upload routes (Authenticated builders and admins)
router
  .route('/:builderId/documents')
  .get(
    flexibleAuth('getBuilders'), 
    builderController.getBuilderDocuments
  )
  .post(
    flexibleAuth('manageBuilders'), 
    uploadSingleDocument('document'), 
    validate(builderValidation.uploadSingleDocument), 
    builderController.uploadSingleDocument
  );

router
  .route('/:builderId/documents/multiple')
  .post(
    flexibleAuth('manageBuilders'), 
    uploadMultipleDocuments('documents', 5), 
    validate(builderValidation.uploadMultipleDocuments), 
    builderController.uploadMultipleDocuments
  );

router
  .route('/:builderId/documents/fields')
  .post(
    flexibleAuth('manageBuilders'), 
    uploadDocumentFields([
      { name: 'license', maxCount: 3 },
      { name: 'certificate', maxCount: 3 },
      { name: 'registration', maxCount: 3 }
    ]), 
    validate(builderValidation.uploadDocumentFields), 
    builderController.uploadDocumentFields
  );

router
  .route('/:builderId/documents/:documentId')
  .delete(
    flexibleAuth('manageBuilders'), 
    builderController.removeDocument
  );

// OTP operations (Public)
router.post('/send-otp', validate(builderValidation.sendOTP), builderController.sendOTP);
router.post('/verify-otp', validate(builderValidation.verifyOTP), builderController.verifyOTP);

export default router;

/**
 * @swagger
 * tags:
 *   name: Builders
 *   description: Builder management and retrieval
 */

/**
 * @swagger
 * /builders:
 *   post:
 *     summary: Create a builder
 *     description: Only admins can create builders.
 *     tags: [Builders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - contactInfo
 *               - address
 *               - company
 *               - city
 *               - reraRegistrationId
 *               - contactPerson
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               contactInfo:
 *                 type: string
 *               address:
 *                 type: string
 *               company:
 *                 type: string
 *               city:
 *                 type: string
 *               reraRegistrationId:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               phone:
 *                 type: string
 *                 pattern: '^\+?[1-9]\d{1,14}$'
 *               website:
 *                 type: string
 *                 format: uri
 *               logo:
 *                 type: string
 *               logoName:
 *                 type: string
 *               supportingDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               name: John Builder
 *               email: john@builder.com
 *               password: password123
 *               contactInfo: +1234567890
 *               address: 123 Main St, City
 *               company: ABC Construction
 *               city: Mumbai
 *               reraRegistrationId: RERA123456
 *               contactPerson: John Doe
 *               phone: +1234567890
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Builder'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all builders
 *     description: Only admins can retrieve all builders.
 *     tags: [Builders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Builder name
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Builder email
 *       - in: query
 *         name: company
 *         schema:
 *           type: string
 *         description: Company name
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: City
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, submitted, approved, rejected]
 *         description: Builder status
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of builders
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Builder'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /builders/{id}:
 *   get:
 *     summary: Get a builder
 *     description: Logged in users can fetch only their own builder information. Only admins can fetch other builders.
 *     tags: [Builders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Builder id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Builder'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a builder
 *     description: Logged in users can only update their own information. Only admins can update other builders.
 *     tags: [Builders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Builder id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               contactInfo:
 *                 type: string
 *               address:
 *                 type: string
 *               company:
 *                 type: string
 *               city:
 *                 type: string
 *               reraRegistrationId:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               phone:
 *                 type: string
 *                 pattern: '^\+?[1-9]\d{1,14}$'
 *               website:
 *                 type: string
 *                 format: uri
 *               logo:
 *                 type: string
 *               logoName:
 *                 type: string
 *               supportingDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, submitted, approved, rejected]
 *               isActive:
 *                 type: boolean
 *             example:
 *               name: John Builder
 *               email: john@builder.com
 *               password: password123
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Builder'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a builder
 *     description: Logged in users can delete only themselves. Only admins can delete other builders.
 *     tags: [Builders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Builder id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

