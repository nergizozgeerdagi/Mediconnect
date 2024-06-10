const Joi = require("joi");

const signupSchema = Joi.object({
   name: Joi.string().min(3).max(30).required(),
   email: Joi.string().email().required(),
   password: Joi.string().min(6).required(),
   faculty: Joi.string().min(2).required(),
   department: Joi.string().min(2).required(),
   year: Joi.string().min(2).required(),
});

const loginSchema = Joi.object({
   email: Joi.string().email().required(),
   password: Joi.string().min(6).required(),
});

const changePasswordSchema = Joi.object({
   newPassword: Joi.string().min(6).required(),
});

const updateProfileSchema = Joi.object({
   name: Joi.string().min(3).max(30).optional(),
   year: Joi.string().min(2).optional(),
   biography: Joi.optional(),
});

const channelSchema = Joi.object({
   name: Joi.string().min(3).required(),
});
const subChannelSchema = Joi.object({
   name: Joi.string().min(3).required(),
   topic: Joi.string().min(3).required(),
});

module.exports = {
   signupSchema,
   loginSchema,
   channelSchema,
   changePasswordSchema,
   updateProfileSchema,
   subChannelSchema,
};
