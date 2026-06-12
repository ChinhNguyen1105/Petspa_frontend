const registerMock = {
  success: true,
  message: "Register successfully",

  data: {
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    user: {
      id: "USR001",
      email: "admin@gmail.com",
      name: "Administrator",
      role: {
        id: 1,
        name: "ADMIN",
        description: "Quản trị hệ thống",
        activeFlag: true,
      },
    },
  },
};

export default registerMock;
