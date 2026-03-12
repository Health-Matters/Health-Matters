import { useUser } from "@clerk/clerk-react";
import practitionerPicture from "../../../assets/practitionerPicture.png";

export const PractitionerTestProfile = () => {
  const { user } = useUser();

  return (
    <div className="p-8 max-w-4xl mx-auto text-center">
      {/* Profile Picture */}
      <div className="max-w-80 max-h-80 mx-auto mb-4">
        <img
          src={practitionerPicture}
          alt="Practitioner Profile"
          className="w-full h-full object-contain rounded-full border-4 border-blue-500"
        />
      </div>

      {/* Dynamic Name and Title */}
      <h2 className="text-xl font-semibold">
        {user?.firstName ? `Dr. ${user.firstName}` : "Dr."}
      </h2>
      <p className="text-gray-600">Practitioner</p>
    </div>
  );
};