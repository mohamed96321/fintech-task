import * as Joi from 'joi';

export default Joi.object({
  MONGO_URI: Joi.string().uri().required(),
  CORS_ORIGIN: Joi.alternatives()
    .try(Joi.string().valid('*'), Joi.string().uri())
    .required(),
});
