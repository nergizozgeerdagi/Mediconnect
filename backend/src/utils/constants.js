const success = (results, statusCode,message = 'success') => {
  return {
    code: statusCode,
    message: message,
    data: results,
  };
};

const errorResponse = (message, statusCode) => {
  // List of common HTTP request code
  const codes = [200, 201, 400, 401, 404, 403, 409, 422, 500];

  // Kodu Alma
  const findCode = codes.find((code) => code == statusCode);

  if (!findCode) statusCode = 500;
  else statusCode = findCode;

  return {
    error: message.replace(/[^=' :.,a-zA-Z0-9]/g, ""),
    code: statusCode,
    success: false,
  };
};

const validation = (error) => {
  return {
    error: error.replace(/[^=' :.,a-zA-Z0-9]/g, ""),
    success: false,
    code: 422,
  };
};

const UserRole = Object.freeze({
  ADMIN: "ADMIN",
});





const UserStatus = Object.freeze({
  UNVERIFIED: "UNVERIFIED",
  VERIFIED: "VERIFIED",
  BLOCKED: "BLOCKED",
});


const Imagestypes = Object.freeze({
  profile: "profile",
});



const SessionStatus = Object.freeze({
  Pending: "Pending",
  Accepted: "Accepted",
  Blocked: "Blocked",
  Cancelled:"Cancelled"

});


module.exports = {
  validation,
  errorResponse,
  success,
  UserRole,
  UserStatus,
  Imagestypes,
  SessionStatus
};



