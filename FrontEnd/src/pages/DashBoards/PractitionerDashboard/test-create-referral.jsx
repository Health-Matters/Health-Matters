import { useState } from "react";

/*
 Team G - Practitioner referral creation form for routing users to the right support (TMG-002) . Done by Vinuli
*/

export const PractitionerTestCreateReferral = () => {

  const initialFormData = {
    patientId: "",
    practitionerId: "",
    referralReason: "",
    serviceType: ""
  };

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});

  const patients = [
    { id: "P001", name: "John Smith" },
    { id: "P002", name: "Sarah Lee" },
    { id: "P003", name: "Emma Johnson" },
  ];

  const practitioners = [
    { id: "PR001", name: "Dr. Sarah Mitchell" },
    { id: "PR002", name: "Dr. James Wilson" },
    { id: "PR003", name: "Dr. Emily Chen" },
  ];

  const serviceTypes = [
    { id: "physio", name: "Physiotherapy" },
    { id: "ot", name: "Occupational Therapy" },
    { id: "psych", name: "Psychology" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user edits field
    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.patientId) newErrors.patientId = "Patient is required";
    if (!formData.practitionerId) newErrors.practitionerId = "Practitioner is required";
    if (!formData.referralReason.trim()) newErrors.referralReason = "Referral reason is required";
    if (!formData.serviceType) newErrors.serviceType = "Service type is required";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log(formData);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">

      <h1 className="text-2xl font-semibold">Create Referral</h1>
      <p className="text-gray-500 mb-6">
        Complete all required fields to submit a patient referral
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-8 space-y-6 border"
      >

        {/* Patient Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Patient
          </label>

          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${
              errors.patientId ? "border-red-500" : ""
            }`}
          >
            <option value="">Select patient</option>

            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}

          </select>

          {errors.patientId && (
            <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
          )}
        </div>

        {/* Practitioner Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Practitioner
          </label>

          <select
            name="practitionerId"
            value={formData.practitionerId}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${
              errors.practitionerId ? "border-red-500" : ""
            }`}
          >
            <option value="">Select practitioner</option>

            {practitioners.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}

          </select>

          {errors.practitionerId && (
            <p className="text-red-500 text-sm mt-1">{errors.practitionerId}</p>
          )}
        </div>

        {/* Referral Reason */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Referral Reason
          </label>

          <textarea
            name="referralReason"
            value={formData.referralReason}
            onChange={handleChange}
            rows="4"
            placeholder="Please provide detailed information about the reason for this referral..."
            className={`w-full border rounded-lg p-3 ${
              errors.referralReason ? "border-red-500" : ""
            }`}
          />

          {errors.referralReason && (
            <p className="text-red-500 text-sm mt-1">{errors.referralReason}</p>
          )}
        </div>

        {/* Service Type Dropdown */}
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">
            Service Type
          </label>

          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${
              errors.serviceType ? "border-red-500" : ""
            }`}
          >
            <option value="">Select service type</option>

            {serviceTypes.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}

          </select>

          {errors.serviceType && (
            <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            className="border px-5 py-2 rounded-lg text-gray-600"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg"
          >
            Submit Referral
          </button>
        </div>

      </form>

      {/* Info box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 text-sm p-4 rounded-lg text-gray-600">
        * indicates required field. All patient information is handled in accordance with GDPR and healthcare data protection regulations.
      </div>

    </div>
  );
};