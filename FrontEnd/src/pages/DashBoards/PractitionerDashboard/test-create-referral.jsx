import { useState } from "react";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { useGetServicesQuery } from "@/store/api/servicesApi";
import { useCreateReferralMutation } from "@/store/api/referralsApi";

export const PractitionerTestCreateReferral = () => {
  const [formData, setFormData] = useState({
    patientClerkUserId: "",
    practitionerClerkUserId: "",
    referralReason: "",
    serviceType: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch employees and practitioners separately
  const { data: employees = [], isLoading: loadingEmployees } = useGetUsersQuery({ role: "employee" });
  const { data: practitioners = [], isLoading: loadingPractitioners } = useGetUsersQuery({ role: "practitioner" });

  // Combine both as patients
  const patients = [...employees, ...practitioners];

  // Services
  const { data: services = [], isLoading: loadingServices } = useGetServicesQuery();

  const [createReferral, { isLoading: isSubmitting }] = useCreateReferralMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.patientClerkUserId || !patients.some(p => p.clerkUserId === formData.patientClerkUserId)) {
      newErrors.patientClerkUserId = "Valid patient is required";
    }
    if (!formData.practitionerClerkUserId || !practitioners.some(p => p.clerkUserId === formData.practitionerClerkUserId)) {
      newErrors.practitionerClerkUserId = "Valid practitioner is required";
    }
    if (!formData.referralReason.trim()) {
      newErrors.referralReason = "Referral reason is required";
    }
    if (!formData.serviceType || !services.some(s => s.name === formData.serviceType)) {
      newErrors.serviceType = "Valid service type is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createReferral({
        patientClerkUserId: formData.patientClerkUserId,
        practitionerClerkUserId: formData.practitionerClerkUserId,
        referralReason: formData.referralReason,
        serviceType: formData.serviceType,
      }).unwrap();

      alert("Referral created successfully");
      handleClear();

    } catch (err) {
      console.error(err);
      alert(err?.data?.message || "Failed to create referral");
    }
  };

  const handleClear = () => {
    setFormData({
      patientClerkUserId: "",
      practitionerClerkUserId: "",
      referralReason: "",
      serviceType: "",
    });
    setErrors({});
  };

  if (loadingEmployees || loadingPractitioners || loadingServices) {
    return <p className="p-8 text-gray-600">Loading data...</p>;
  }

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
          <label className="block text-sm font-medium mb-2">Patient</label>
          <select
            name="patientClerkUserId"
            value={formData.patientClerkUserId}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${errors.patientClerkUserId ? "border-red-500" : ""}`}
          >
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.clerkUserId} value={patient.clerkUserId}>
                {patient.firstName} {patient.lastName} ({patient.role})
              </option>
            ))}
          </select>
          {errors.patientClerkUserId && (
            <p className="text-red-500 text-sm mt-1">{errors.patientClerkUserId}</p>
          )}
        </div>

        {/* Practitioner Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2">Practitioner</label>
          <select
            name="practitionerClerkUserId"
            value={formData.practitionerClerkUserId}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${errors.practitionerClerkUserId ? "border-red-500" : ""}`}
          >
            <option value="">Select practitioner</option>
            {practitioners.map((doc) => (
              <option key={doc.clerkUserId} value={doc.clerkUserId}>
                {doc.firstName} {doc.lastName}
              </option>
            ))}
          </select>
          {errors.practitionerClerkUserId && (
            <p className="text-red-500 text-sm mt-1">{errors.practitionerClerkUserId}</p>
          )}
        </div>

        {/* Referral Reason */}
        <div>
          <label className="block text-sm font-medium mb-2">Referral Reason</label>
          <textarea
            name="referralReason"
            value={formData.referralReason}
            onChange={handleChange}
            rows="4"
            placeholder="Please provide detailed information about the reason for this referral..."
            className={`w-full border rounded-lg p-3 ${errors.referralReason ? "border-red-500" : ""}`}
          />
          {errors.referralReason && (
            <p className="text-red-500 text-sm mt-1">{errors.referralReason}</p>
          )}
        </div>

        {/* Service Type Dropdown */}
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-2">Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className={`w-full border rounded-lg p-3 ${errors.serviceType ? "border-red-500" : ""}`}
          >
            <option value="">Select service type</option>
            {services.map((service) => (
              <option key={service._id} value={service.name}>
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
            onClick={handleClear}
            className="border px-5 py-2 rounded-lg text-gray-600"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Referral"}
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