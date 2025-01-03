import mongoose from "mongoose";

const formSubmissionSchema = new mongoose.Schema({
  formTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormTemplate',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  fields: [{
    fieldName: String,
    value: String,
    isAutoFilled: Boolean,
    studentPropertyPath: String
  }],
  resumeUrl: String
});

/*  formSubmissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const template = await mongoose.model('FormTemplate').findById(this.formTemplateId);
    const student = await mongoose.model('Student').findById(this.studentId);
    this.fields = template.fields.map(field => ({
      fieldName: field.fieldName,
      value: field.isAutoFill ? student[field.studentPropertyPath] : field.value,
      isAutoFilled: field.isAutoFill
    }));
  }
  next();
});
 */
const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);

export default FormSubmission;